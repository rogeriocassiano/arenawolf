-- ============================================================
-- ARENA WOLF — Migration COMPLETA (v5 + v6 + v7 + v8)
-- Execute tudo de uma vez no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: Migration v5 — Apps/Launcher + Correções
-- ============================================================

-- APPS: catálogo global de apps
CREATE TABLE IF NOT EXISTS public.apps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'Jogo' CHECK (category IN ('Jogo','Plataforma','Navegador','Utilitário','Outro')),
  exe_path     TEXT NOT NULL,
  exe_args     TEXT DEFAULT '',
  icon_url     TEXT DEFAULT '',
  banner_url   TEXT DEFAULT '',
  sort_order   INTEGER DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MACHINE_APPS: apps liberados por máquina
CREATE TABLE IF NOT EXISTS public.machine_apps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id  UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  app_id      UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(machine_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_machine_apps_machine ON public.machine_apps(machine_id);
CREATE INDEX IF NOT EXISTS idx_apps_active ON public.apps(active);

-- RLS Apps
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view active apps" ON public.apps;
DROP POLICY IF EXISTS "Admin can manage apps" ON public.apps;
DROP POLICY IF EXISTS "Anyone authenticated can view machine apps" ON public.machine_apps;
DROP POLICY IF EXISTS "Admin can manage machine apps" ON public.machine_apps;

CREATE POLICY "Anyone authenticated can view active apps" ON public.apps
  FOR SELECT TO authenticated USING (active = TRUE);
CREATE POLICY "Admin can manage apps" ON public.apps
  FOR ALL USING (public.is_staff());
CREATE POLICY "Anyone authenticated can view machine apps" ON public.machine_apps
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin can manage machine apps" ON public.machine_apps
  FOR ALL USING (public.is_staff());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.apps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_apps;

-- Atualizar sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS login_method TEXT DEFAULT 'pin'
  CHECK (login_method IN ('pin', 'credentials'));

-- Seed apps
INSERT INTO public.apps (name, description, category, exe_path, icon_url, sort_order) VALUES
  ('Steam', 'Plataforma de jogos Steam', 'Plataforma', 'C:\Program Files (x86)\Steam\steam.exe', 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg', 1),
  ('Epic Games', 'Epic Games Launcher', 'Plataforma', 'C:\Program Files (x86)\Epic Games\Launcher\Portal\Binaries\Win32\EpicGamesLauncher.exe', 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg', 2),
  ('CS2', 'Counter-Strike 2', 'Jogo', 'C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\cs2.exe', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 3),
  ('Valorant', 'Valorant', 'Jogo', 'C:\Riot Games\VALORANT\live\VALORANT.exe', 'https://playvalorant.com/static/images/social-share.jpg', 4),
  ('Discord', 'Discord', 'Utilitário', 'C:\Users\%USERNAME%\AppData\Local\Discord\Update.exe --processStart Discord.exe', 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 2: Migration v6 — Correções Transactions + Sessions
-- ============================================================

-- Corrigir transactions_type_check
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('credit_purchase', 'credit_add', 'credit_request', 'reservation', 'session_end', 'product', 'refund'));

-- Policy INSERT para admin
DROP POLICY IF EXISTS "Admin can insert transactions" ON public.transactions;
CREATE POLICY "Admin can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (public.is_staff());

-- Realtime transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'transactions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END $$;

-- validate_pin_and_start (limite 240min)
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
  WHERE mp.pin = p_pin AND mp.machine_id = p_machine_id
    AND mp.used = FALSE AND mp.expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'PIN inválido ou expirado');
  END IF;

  UPDATE public.machine_pins SET used = TRUE, used_at = NOW() WHERE id = v_pin_record.id;
  v_minutes := LEAST(v_pin_record.credits_minutes, 240);

  BEGIN
    v_session_id := public.start_session(p_machine_id, v_pin_record.user_id, v_minutes);
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

-- end_session (registrar transaction)
CREATE OR REPLACE FUNCTION public.end_session(
  p_session_id UUID,
  p_ended_by   TEXT DEFAULT 'admin'
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session    RECORD;
  v_elapsed    INTEGER;
BEGIN
  SELECT * INTO v_session FROM public.sessions WHERE id = p_session_id AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sessão não encontrada ou já encerrada';
  END IF;

  v_elapsed := CEIL(EXTRACT(EPOCH FROM (NOW() - v_session.started_at)) / 60);

  UPDATE public.sessions SET status = 'finished', ended_by = p_ended_by,
    ended_at = NOW(), credits_used = v_elapsed WHERE id = p_session_id;

  UPDATE public.profiles SET credits_minutes = GREATEST(0, credits_minutes - v_elapsed)
  WHERE id = v_session.user_id;

  UPDATE public.machines SET status = 'free' WHERE id = v_session.machine_id;

  INSERT INTO public.transactions (user_id, type, amount, description)
  VALUES (v_session.user_id, 'session_end', -v_elapsed,
    'Sessão encerrada por ' || p_ended_by || ' — ' || v_elapsed || 'min utilizados');
END;
$$;

-- ============================================================
-- PARTE 3: Migration v7 — Wake-on-LAN
-- ============================================================

ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS mac_address TEXT DEFAULT NULL;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS shutdown_requested BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'machines') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
  END IF;
END $$;

-- ============================================================
-- PARTE 4: Migration v8 — Sistema Avançado de Créditos
-- ============================================================

-- 1. GIFT CARDS / CÓDIGOS PROMOCIONAIS
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage', 'bonus_hours')),
  value INTEGER NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_code_uses (
  code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now(),
  credits_added INTEGER NOT NULL,
  PRIMARY KEY (code_id, user_id)
);

-- 2. ASSINATURAS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL,
  credits_per_month INTEGER NOT NULL,
  stripe_price_id TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  credits_per_cycle INTEGER NOT NULL,
  last_credit_at TIMESTAMPTZ,
  next_credit_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- 3. PROGRAMA DE INDICAÇÃO
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  credited_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

-- 4. CRÉDITOS TIPADOS
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('paid', 'bonus', 'promo', 'cashback', 'referral', 'subscription')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT
);

CREATE INDEX IF NOT EXISTS idx_credit_balances_user_type ON credit_balances(user_id, type);
CREATE INDEX IF NOT EXISTS idx_credit_balances_expires ON credit_balances(user_id, expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_credit ON subscriptions(next_credit_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active, valid_from, valid_until);

-- 5. PREÇO DINÂMICO
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO dynamic_pricing_rules (name, day_of_week, start_time, end_time, multiplier, priority) VALUES
  ('Madrugada OFF', NULL, '00:00', '06:00', 0.70, 10),
  ('Manhã OFF', NULL, '06:00', '12:00', 0.80, 9),
  ('Domingo OFF', 0, NULL, NULL, 0.60, 8),
  ('Noite Normal', NULL, '19:00', '23:59', 1.00, 5)
ON CONFLICT DO NOTHING;

-- 6. RESERVAS COM HOLD
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS credits_held INTEGER DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS no_show BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 7. HISTÓRICO DETALHADO
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS related_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS related_type TEXT;

-- 8. FUNÇÕES AUXILIARES
CREATE OR REPLACE FUNCTION get_available_credits(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM credit_balances
  WHERE user_id = user_uuid AND (expires_at IS NULL OR expires_at > now());
  RETURN total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_promo_code_valid(code_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM promo_codes
    WHERE code = code_text AND active = TRUE
      AND valid_from <= now()
      AND (valid_until IS NULL OR valid_until > now())
      AND (max_uses IS NULL OR uses_count < max_uses)
  );
END;
$$ LANGUAGE plpgsql;

-- 9. RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gerenciam tudo" ON promo_codes;
DROP POLICY IF EXISTS "Usuário vê próprios uses" ON promo_code_uses;
DROP POLICY IF EXISTS "Todos veem planos ativos" ON subscription_plans;
DROP POLICY IF EXISTS "Usuário vê própria assinatura" ON subscriptions;
DROP POLICY IF EXISTS "Admins veem todas assinaturas" ON subscriptions;
DROP POLICY IF EXISTS "Usuário vê próprios créditos" ON credit_balances;
DROP POLICY IF EXISTS "Admins gerenciam preços dinâmicos" ON dynamic_pricing_rules;
DROP POLICY IF EXISTS "Todos veem regras ativas" ON dynamic_pricing_rules;

CREATE POLICY "Admins gerenciam tudo" ON promo_codes FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));
CREATE POLICY "Usuário vê próprios uses" ON promo_code_uses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Todos veem planos ativos" ON subscription_plans FOR SELECT USING (active = TRUE);
CREATE POLICY "Usuário vê própria assinatura" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins veem todas assinaturas" ON subscriptions FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));
CREATE POLICY "Usuário vê próprios créditos" ON credit_balances FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins gerenciam preços dinâmicos" ON dynamic_pricing_rules FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));
CREATE POLICY "Todos veem regras ativas" ON dynamic_pricing_rules FOR SELECT USING (active = TRUE);

-- 10. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_balances;

-- Seeding planos
INSERT INTO subscription_plans (id, name, description, monthly_price, credits_per_month, active) VALUES
  ('basic', 'Wolf Básico', '20 horas por mês', 4990, 1200, TRUE),
  ('gamer', 'Wolf Gamer', '40 horas por mês', 8990, 2400, TRUE),
  ('pro', 'Wolf Pro', '80 horas por mês', 14990, 4800, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FIM
-- ============================================================
