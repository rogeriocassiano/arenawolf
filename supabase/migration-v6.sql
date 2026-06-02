-- ============================================================
-- ARENA WOLF — Migration v6
-- Corrige CHECK constraint da tabela transactions para aceitar
-- todos os tipos usados pelo sistema atual
-- Execute no SQL Editor do Supabase APÓS migration-v5
-- ============================================================

-- 1. Remover constraint antiga (só aceita credit_purchase, reservation, product, refund)
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Recriar com todos os tipos reais usados pelo sistema
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN (
    'credit_purchase',   -- compra direta (legado)
    'credit_add',        -- créditos adicionados manualmente pelo operador via painel
    'credit_request',    -- solicitação de crédito pelo usuário (aguarda pagamento no balcão)
    'reservation',       -- reserva de máquina
    'session_end',       -- débito automático ao encerrar sessão
    'product',           -- compra de produto na loja
    'refund'             -- estorno
  ));

-- 3. Adicionar INSERT policy para transactions (service role precisa inserir)
-- O schema original só tem INSERT WITH CHECK (auth.uid() = user_id)
-- mas o addCredits usa createAdminClient (service role) sem auth.uid()
DROP POLICY IF EXISTS "Admin can insert transactions" ON public.transactions;
CREATE POLICY "Admin can insert transactions" ON public.transactions
  FOR INSERT USING (public.is_staff());

-- 4. Garantir que transactions também aparece no Realtime (para financeiro ao vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- 5. Corrigir validate_pin_and_start: limitar sessão a 240min (igual ao agente)
CREATE OR REPLACE FUNCTION public.validate_pin_and_start(
  p_pin        CHAR(6),
  p_machine_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pin_record  RECORD;
  v_session_id  UUID;
  v_minutes     INTEGER;
BEGIN
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

  UPDATE public.machine_pins SET used = TRUE, used_at = NOW()
  WHERE id = v_pin_record.id;

  -- Limitar sessão a no máximo 4h (240min)
  v_minutes := LEAST(v_pin_record.credits_minutes, 240);

  BEGIN
    v_session_id := public.start_session(
      p_machine_id,
      v_pin_record.user_id,
      v_minutes
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'user_id', v_pin_record.user_id,
    'nickname', v_pin_record.nickname,
    'credits_minutes', v_pin_record.credits_minutes,
    'ends_at', (NOW() + (v_minutes || ' minutes')::INTERVAL)
  );
END;
$$;

-- 6. Corrigir end_session: registrar transaction de débito ao encerrar
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

  v_elapsed := CEIL(EXTRACT(EPOCH FROM (NOW() - v_session.started_at)) / 60);

  UPDATE public.sessions SET
    status = 'finished',
    ended_by = p_ended_by,
    ended_at = NOW(),
    credits_used = v_elapsed
  WHERE id = p_session_id;

  UPDATE public.profiles SET
    credits_minutes = GREATEST(0, credits_minutes - v_elapsed)
  WHERE id = v_session.user_id;

  UPDATE public.machines SET status = 'free' WHERE id = v_session.machine_id;

  -- Registrar débito na tabela de transactions para rastreabilidade
  INSERT INTO public.transactions (user_id, type, amount, description)
  VALUES (
    v_session.user_id,
    'session_end',
    -v_elapsed,
    'Sessão encerrada por ' || p_ended_by || ' — ' || v_elapsed || 'min utilizados'
  );
END;
$$;
