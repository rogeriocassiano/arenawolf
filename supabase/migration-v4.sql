-- ============================================================
-- ARENA WOLF — Migration v4
-- Sistema de sessões de LAN house
-- Tabelas: sessions, machine_pins
-- Execute no SQL Editor do Supabase APÓS migration-v3
-- ============================================================

-- SESSIONS: sessão ativa em cada máquina
CREATE TABLE IF NOT EXISTS public.sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id      UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ NOT NULL,
  credits_at_start INTEGER NOT NULL DEFAULT 0,
  credits_used    INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished', 'expired')),
  ended_by        TEXT CHECK (ended_by IN ('user', 'admin', 'system')),
  ended_at        TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MACHINE_PINS: PIN temporário para login no PC
CREATE TABLE IF NOT EXISTS public.machine_pins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  machine_id  UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  pin         CHAR(6) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_machine_id ON public.sessions(machine_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_machine_pins_pin ON public.machine_pins(pin);
CREATE INDEX IF NOT EXISTS idx_machine_pins_user_id ON public.machine_pins(user_id);

-- RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_pins ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all sessions" ON public.sessions
  FOR ALL USING (public.is_staff());
CREATE POLICY "Service role full access sessions" ON public.sessions
  FOR ALL USING (TRUE);

-- Machine pins policies
CREATE POLICY "Users can view own pins" ON public.machine_pins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pins" ON public.machine_pins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage all pins" ON public.machine_pins
  FOR ALL USING (public.is_staff());

-- Realtime para o agente
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_pins;

-- ============================================================
-- RPC: iniciar sessão (atômico)
-- ============================================================
CREATE OR REPLACE FUNCTION public.start_session(
  p_machine_id UUID,
  p_user_id    UUID,
  p_minutes    INTEGER
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session_id UUID;
  v_credits    INTEGER;
BEGIN
  -- Verificar créditos do usuário
  SELECT credits_minutes INTO v_credits
  FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF v_credits < p_minutes THEN
    RAISE EXCEPTION 'Créditos insuficientes';
  END IF;

  -- Encerrar sessão ativa anterior nesta máquina (se houver)
  UPDATE public.sessions
  SET status = 'finished', ended_by = 'system', ended_at = NOW()
  WHERE machine_id = p_machine_id AND status = 'active';

  -- Criar nova sessão
  INSERT INTO public.sessions (machine_id, user_id, started_at, ends_at, credits_at_start)
  VALUES (p_machine_id, p_user_id, NOW(), NOW() + (p_minutes || ' minutes')::INTERVAL, v_credits)
  RETURNING id INTO v_session_id;

  -- Atualizar status da máquina
  UPDATE public.machines SET status = 'busy' WHERE id = p_machine_id;

  RETURN v_session_id;
END;
$$;

-- ============================================================
-- RPC: encerrar sessão (atômico)
-- ============================================================
CREATE OR REPLACE FUNCTION public.end_session(
  p_session_id UUID,
  p_ended_by   TEXT DEFAULT 'admin'
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session    RECORD;
  v_elapsed    INTEGER;
BEGIN
  SELECT * INTO v_session
  FROM public.sessions WHERE id = p_session_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sessão não encontrada ou já encerrada';
  END IF;

  -- Calcular minutos usados (arredondar para cima)
  v_elapsed := CEIL(EXTRACT(EPOCH FROM (NOW() - v_session.started_at)) / 60);

  -- Encerrar sessão
  UPDATE public.sessions SET
    status = 'finished',
    ended_by = p_ended_by,
    ended_at = NOW(),
    credits_used = v_elapsed
  WHERE id = p_session_id;

  -- Descontar créditos do usuário
  UPDATE public.profiles SET
    credits_minutes = GREATEST(0, credits_minutes - v_elapsed)
  WHERE id = v_session.user_id;

  -- Liberar máquina
  UPDATE public.machines SET status = 'free' WHERE id = v_session.machine_id;
END;
$$;

-- ============================================================
-- RPC: validar PIN e iniciar sessão no PC
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_pin_and_start(
  p_pin        CHAR(6),
  p_machine_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pin_record  RECORD;
  v_session_id  UUID;
  v_profile     RECORD;
BEGIN
  -- Buscar PIN válido
  SELECT mp.*, pr.credits_minutes, pr.nickname
  INTO v_pin_record
  FROM public.machine_pins mp
  JOIN public.profiles pr ON pr.id = mp.user_id
  WHERE mp.pin = p_pin
    AND mp.machine_id = p_machine_id
    AND mp.used = FALSE
    AND mp.expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'PIN inválido ou expirado');
  END IF;

  -- Marcar PIN como usado
  UPDATE public.machine_pins SET used = TRUE, used_at = NOW()
  WHERE id = v_pin_record.id;

  -- Iniciar sessão com os créditos disponíveis
  BEGIN
    v_session_id := public.start_session(
      p_machine_id,
      v_pin_record.user_id,
      v_pin_record.credits_minutes
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'user_id', v_pin_record.user_id,
    'nickname', v_pin_record.nickname,
    'credits_minutes', v_pin_record.credits_minutes,
    'ends_at', (NOW() + (v_pin_record.credits_minutes || ' minutes')::INTERVAL)
  );
END;
$$;

-- ============================================================
-- RPC: adicionar tempo extra a uma sessão ativa
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_session_time(
  p_session_id UUID,
  p_minutes    INTEGER
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.sessions
  SET ends_at = ends_at + (p_minutes || ' minutes')::INTERVAL
  WHERE id = p_session_id AND status = 'active';
END;
$$;

-- ============================================================
-- Cleanup automático de PINs expirados (cron job via pg_cron se disponível)
-- Alternativa: deletar PINs expirados via função
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_pins()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.machine_pins
  WHERE expires_at < NOW() AND used = FALSE;
  
  -- Expirar sessões que passaram do ends_at
  UPDATE public.sessions SET
    status = 'expired',
    ended_by = 'system',
    ended_at = NOW()
  WHERE status = 'active' AND ends_at < NOW();
  
  -- Liberar máquinas com sessões expiradas
  UPDATE public.machines SET status = 'free'
  WHERE id IN (
    SELECT machine_id FROM public.sessions
    WHERE status = 'expired' AND ended_at > NOW() - INTERVAL '1 minute'
  );
$$;
