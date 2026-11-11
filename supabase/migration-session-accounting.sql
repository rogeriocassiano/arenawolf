BEGIN;

ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS agent_update_until timestamptz;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS agent_update_instance uuid;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS agent_instance_id uuid;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS agent_heartbeat_at timestamptz;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS agent_full_balance boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS sessions_agent_heartbeat_active ON public.sessions(agent_heartbeat_at) WHERE status = 'active' AND agent_heartbeat_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.settle_session_internal(p_session_id uuid, p_ended_by text, p_stop_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.sessions%ROWTYPE;
  wallet integer;
  debit integer;
  stop_at timestamptz;
  bucket record;
  outstanding integer;
  taken integer;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sessão não encontrada'; END IF;
  PERFORM 1 FROM public.machines WHERE id = s.machine_id FOR UPDATE;
  SELECT * INTO s FROM public.sessions WHERE id = p_session_id FOR UPDATE;
  IF s.status <> 'active' THEN RETURN; END IF;
  IF p_ended_by = 'system' AND s.agent_heartbeat_at IS NOT NULL AND p_stop_at < s.agent_heartbeat_at THEN RETURN; END IF;
  SELECT credits_minutes INTO wallet FROM public.profiles WHERE id = s.user_id FOR UPDATE;
  stop_at := GREATEST(s.started_at, LEAST(COALESCE(p_stop_at, clock_timestamp()), s.ends_at, clock_timestamp()));
  debit := LEAST(GREATEST(0, wallet), GREATEST(0, CEIL(EXTRACT(epoch FROM (stop_at - s.started_at)) / 60)::integer));
  UPDATE public.sessions SET status = 'finished', ended_by = p_ended_by, ended_at = stop_at, credits_used = debit WHERE id = s.id;
  UPDATE public.profiles SET credits_minutes = credits_minutes - debit WHERE id = s.user_id;
  outstanding := debit;
  FOR bucket IN SELECT id, amount FROM public.credit_balances WHERE user_id = s.user_id AND amount > 0 ORDER BY expires_at ASC NULLS LAST, id FOR UPDATE LOOP
    EXIT WHEN outstanding <= 0;
    taken := LEAST(bucket.amount, outstanding);
    UPDATE public.credit_balances SET amount = amount - taken WHERE id = bucket.id;
    outstanding := outstanding - taken;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE machine_id = s.machine_id AND status = 'active') THEN
    UPDATE public.machines SET status = 'free' WHERE id = s.machine_id AND status = 'busy';
  END IF;
  INSERT INTO public.transactions(user_id, type, amount, description, related_id, related_type)
  VALUES (s.user_id, 'session_end', -debit, 'Sessão encerrada por ' || p_ended_by || ' — ' || debit || 'min utilizados', s.id, 'session');
END;
$$;
REVOKE ALL ON FUNCTION public.settle_session_internal(uuid, text, timestamptz) FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.end_session(p_session_id uuid, p_ended_by text DEFAULT 'admin')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.sessions%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sessão não encontrada'; END IF;
  IF COALESCE(auth.role(), '') <> 'service_role' AND auth.uid() IS DISTINCT FROM s.user_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff') AND NOT banned) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  IF p_ended_by NOT IN ('user', 'admin', 'system') THEN RAISE EXCEPTION 'Motivo inválido'; END IF;
  PERFORM public.settle_session_internal(s.id, p_ended_by,
    CASE WHEN s.agent_heartbeat_at IS NOT NULL AND (p_ended_by <> 'user' OR s.agent_heartbeat_at < clock_timestamp() - interval '45 seconds')
      THEN s.agent_heartbeat_at ELSE clock_timestamp() END);
END;
$$;
REVOKE ALL ON FUNCTION public.end_session(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.end_session(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.start_session(p_machine_id uuid, p_user_id uuid, p_minutes integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  machine public.machines%ROWTYPE;
  person public.profiles%ROWTYPE;
  active public.sessions%ROWTYPE;
  sid uuid;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff') AND NOT banned) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT * INTO machine FROM public.machines WHERE id = p_machine_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Máquina não encontrada'; END IF;
  IF machine.agent_update_until > clock_timestamp() THEN RAISE EXCEPTION 'Máquina em atualização. Aguarde alguns instantes.'; END IF;
  SELECT * INTO person FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND OR person.banned THEN RAISE EXCEPTION 'Conta indisponível'; END IF;
  SELECT * INTO active FROM public.sessions WHERE machine_id = p_machine_id AND status = 'active' ORDER BY started_at DESC LIMIT 1;
  IF active.id IS NOT NULL THEN
    IF machine.status = 'busy' AND active.user_id = p_user_id AND active.ends_at > clock_timestamp() THEN RETURN active.id; END IF;
    RAISE EXCEPTION 'Máquina indisponível';
  END IF;
  IF machine.status <> 'free' THEN RAISE EXCEPTION 'Máquina indisponível'; END IF;
  IF EXISTS (SELECT 1 FROM public.sessions WHERE user_id = p_user_id AND status = 'active') THEN RAISE EXCEPTION 'Usuário já possui sessão ativa'; END IF;
  IF p_minutes IS NULL OR p_minutes < 1 OR person.credits_minutes < p_minutes THEN RAISE EXCEPTION 'Créditos insuficientes'; END IF;
  INSERT INTO public.sessions(machine_id, user_id, started_at, ends_at, credits_at_start)
  VALUES(p_machine_id, p_user_id, clock_timestamp(), clock_timestamp() + p_minutes * interval '1 minute', person.credits_minutes)
  RETURNING id INTO sid;
  UPDATE public.machines SET status = 'busy' WHERE id = p_machine_id;
  RETURN sid;
END;
$$;
REVOKE ALL ON FUNCTION public.start_session(uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_session(uuid, uuid, integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.start_agent_session(p_machine_id uuid, p_user_id uuid, p_instance_id uuid, p_resume_only boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  machine public.machines%ROWTYPE;
  active public.sessions%ROWTYPE;
  person public.profiles%ROWTYPE;
  sid uuid;
  resumed boolean := false;
BEGIN
  SELECT * INTO machine FROM public.machines WHERE id = p_machine_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Máquina não encontrada'); END IF;
  IF machine.agent_update_until > clock_timestamp() THEN RETURN jsonb_build_object('error', 'Máquina em atualização. Aguarde alguns instantes.'); END IF;
  IF machine.status NOT IN ('free', 'busy') THEN RETURN jsonb_build_object('error', 'Máquina indisponível'); END IF;
  SELECT * INTO person FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND OR person.banned THEN RETURN jsonb_build_object('error', 'Conta indisponível'); END IF;
  IF p_instance_id IS NULL THEN RETURN jsonb_build_object('error', 'Identificação do agente ausente'); END IF;
  SELECT * INTO active FROM public.sessions WHERE machine_id = p_machine_id AND status = 'active' ORDER BY started_at DESC LIMIT 1;
  IF active.id IS NOT NULL THEN
    IF active.user_id <> p_user_id THEN RETURN jsonb_build_object('error', 'Máquina em uso por outro usuário'); END IF;
    IF active.agent_instance_id IS NULL THEN RETURN jsonb_build_object('error', 'Sessão da versão anterior: solicite ao atendente conferir o consumo e encerrá-la antes de atualizar.'); END IF;
    IF active.agent_instance_id = p_instance_id AND active.agent_heartbeat_at >= clock_timestamp() - interval '45 seconds' AND active.ends_at > clock_timestamp() THEN
      sid := active.id;
      resumed := true;
    ELSE
      IF p_resume_only THEN RETURN jsonb_build_object('error', 'Nenhuma sessão conectada para retomar'); END IF;
      PERFORM public.settle_session_internal(active.id, 'system', active.agent_heartbeat_at);
    END IF;
  END IF;
  IF sid IS NULL THEN
    IF p_resume_only THEN RETURN jsonb_build_object('error', 'Nenhuma sessão conectada para retomar'); END IF;
    SELECT * INTO person FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    IF person.credits_minutes <= 0 THEN RETURN jsonb_build_object('error', 'Sem créditos disponíveis'); END IF;
    sid := public.start_session(p_machine_id, p_user_id, person.credits_minutes);
    UPDATE public.sessions SET agent_instance_id = p_instance_id, agent_heartbeat_at = clock_timestamp(), agent_full_balance = true WHERE id = sid;
  END IF;
  SELECT * INTO active FROM public.sessions WHERE id = sid;
  SELECT * INTO person FROM public.profiles WHERE id = p_user_id;
  RETURN jsonb_build_object('session_id', sid, 'machine', machine.name, 'user', person.nickname, 'user_id', person.id,
    'credits_minutes', GREATEST(0, person.credits_minutes - CEIL(EXTRACT(epoch FROM (clock_timestamp() - active.started_at)) / 60)::integer),
    'started_at', active.started_at, 'ends_at', active.ends_at, 'resumed', resumed);
END;
$$;
REVOKE ALL ON FUNCTION public.start_agent_session(uuid, uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_agent_session(uuid, uuid, uuid, boolean) TO service_role;

CREATE OR REPLACE FUNCTION public.agent_session_heartbeat(p_session_id uuid, p_machine_id uuid, p_instance_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.sessions%ROWTYPE; wallet integer; next_end timestamptz; blocked boolean;
BEGIN
  PERFORM 1 FROM public.machines WHERE id = p_machine_id FOR UPDATE;
  SELECT * INTO s FROM public.sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR s.machine_id <> p_machine_id OR s.agent_instance_id IS DISTINCT FROM p_instance_id THEN
    RETURN jsonb_build_object('error', 'Sessão não corresponde a este agente');
  END IF;
  IF s.status <> 'active' THEN RETURN jsonb_build_object('active', false); END IF;
  IF s.agent_heartbeat_at < clock_timestamp() - interval '45 seconds' THEN
    PERFORM public.settle_session_internal(s.id, 'system', s.agent_heartbeat_at);
    RETURN jsonb_build_object('active', false);
  END IF;
  SELECT credits_minutes, banned INTO wallet, blocked FROM public.profiles WHERE id = s.user_id FOR UPDATE;
  IF blocked THEN
    PERFORM public.settle_session_internal(s.id, 'system', s.agent_heartbeat_at);
    RETURN jsonb_build_object('active', false);
  END IF;
  next_end := CASE WHEN s.agent_full_balance THEN s.started_at + wallet * interval '1 minute' ELSE LEAST(s.ends_at, s.started_at + wallet * interval '1 minute') END;
  IF next_end <= clock_timestamp() THEN
    PERFORM public.settle_session_internal(s.id, 'system', next_end);
    RETURN jsonb_build_object('active', false);
  END IF;
  UPDATE public.sessions SET agent_heartbeat_at = clock_timestamp(), ends_at = next_end WHERE id = s.id RETURNING * INTO s;
  RETURN jsonb_build_object('active', true, 'ends_at', s.ends_at,
    'credits_minutes', GREATEST(0, wallet - CEIL(EXTRACT(epoch FROM (clock_timestamp() - s.started_at)) / 60)::integer));
END;
$$;
REVOKE ALL ON FUNCTION public.agent_session_heartbeat(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.agent_session_heartbeat(uuid, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.settle_disconnected_sessions()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; total integer := 0;
BEGIN
  FOR s IN SELECT id, agent_heartbeat_at FROM public.sessions WHERE status = 'active' AND agent_heartbeat_at < clock_timestamp() - interval '45 seconds' ORDER BY machine_id LOOP
    PERFORM public.settle_session_internal(s.id, 'system', s.agent_heartbeat_at);
    total := total + 1;
  END LOOP;
  UPDATE public.machines SET agent_update_until = NULL, agent_update_instance = NULL WHERE agent_update_until < clock_timestamp();
  RETURN total;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_disconnected_sessions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_disconnected_sessions() TO service_role;

CREATE OR REPLACE FUNCTION public.validate_pin_and_start_agent(p_pin text, p_machine_id uuid, p_instance_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pin_row public.machine_pins%ROWTYPE; result jsonb;
BEGIN
  SELECT * INTO pin_row FROM public.machine_pins WHERE pin = p_pin AND machine_id = p_machine_id AND NOT used AND expires_at > clock_timestamp() FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'PIN inválido ou expirado'); END IF;
  result := public.start_agent_session(p_machine_id, pin_row.user_id, p_instance_id);
  IF result ? 'error' THEN RETURN result; END IF;
  UPDATE public.machine_pins SET used = true, used_at = clock_timestamp() WHERE id = pin_row.id;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_pin_and_start_agent(text, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_pin_and_start_agent(text, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.attach_agent_session(p_session_id uuid, p_machine_id uuid, p_instance_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.sessions%ROWTYPE;
BEGIN
  PERFORM 1 FROM public.machines WHERE id = p_machine_id FOR UPDATE;
  SELECT * INTO s FROM public.sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR s.machine_id <> p_machine_id OR s.status <> 'active' OR p_instance_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Sessão indisponível');
  END IF;
  IF s.agent_instance_id IS NULL THEN
    IF s.started_at < clock_timestamp() - interval '30 seconds' THEN RETURN jsonb_build_object('error', 'Sessão antiga exige conferência do atendente'); END IF;
    UPDATE public.sessions SET agent_instance_id = p_instance_id, agent_heartbeat_at = clock_timestamp() WHERE id = s.id;
  ELSIF s.agent_instance_id <> p_instance_id THEN
    RETURN jsonb_build_object('error', 'Sessão vinculada a outro agente');
  END IF;
  RETURN public.agent_session_heartbeat(p_session_id, p_machine_id, p_instance_id);
END;
$$;
REVOKE ALL ON FUNCTION public.attach_agent_session(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_agent_session(uuid, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_agent_update(p_machine_id uuid, p_instance_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE machine public.machines%ROWTYPE;
BEGIN
  SELECT * INTO machine FROM public.machines WHERE id = p_machine_id FOR UPDATE;
  IF NOT FOUND OR machine.status <> 'free' OR p_instance_id IS NULL OR EXISTS(SELECT 1 FROM public.sessions WHERE machine_id = p_machine_id AND status = 'active') THEN RETURN false; END IF;
  IF machine.agent_update_until > clock_timestamp() AND machine.agent_update_instance IS DISTINCT FROM p_instance_id THEN RETURN false; END IF;
  UPDATE public.machines SET agent_update_until = clock_timestamp() + interval '10 minutes', agent_update_instance = p_instance_id WHERE id = p_machine_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_agent_update(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_agent_update(uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.release_agent_update(p_machine_id uuid, p_instance_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.machines SET agent_update_until = NULL, agent_update_instance = NULL WHERE id = p_machine_id AND agent_update_instance = p_instance_id;
END;
$$;
REVOKE ALL ON FUNCTION public.release_agent_update(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_agent_update(uuid, uuid) TO service_role;

COMMIT;
