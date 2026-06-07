-- ============================================================
-- ARENA WOLF — Migration v8
-- Sistema Avançado de Créditos
-- Gift Cards, Assinaturas, Indicações, Cashback, Preço Dinâmico
-- ============================================================

-- 1. GIFT CARDS / CÓDIGOS PROMOCIONAIS
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage', 'bonus_hours')),
  value INTEGER NOT NULL, -- minutos ou percentual
  max_uses INTEGER, -- NULL = ilimitado
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ, -- NULL = não expira
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

-- 2. ASSINATURAS / PLANOS RECORRENTES
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY, -- 'basic', 'gamer', 'pro'
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL, -- em centavos
  credits_per_month INTEGER NOT NULL, -- em minutos
  stripe_price_id TEXT, -- ID do plano no Stripe
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  credits_per_cycle INTEGER NOT NULL,
  last_credit_at TIMESTAMPTZ, -- quando adicionou créditos pela última vez
  next_credit_at TIMESTAMPTZ, -- quando deve adicionar próximos créditos
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(user_id, status) WHERE status = 'active' -- um usuário só pode ter uma assinatura ativa
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
  UNIQUE(referred_id) -- cada usuário só pode ser indicado uma vez
);

-- 4. CRÉDITOS TIPADOS (Paid vs Bonus com expiração)
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('paid', 'bonus', 'promo', 'cashback', 'referral', 'subscription')),
  expires_at TIMESTAMPTZ, -- NULL = não expira
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT -- descrição da origem
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_balances_user_type ON credit_balances(user_id, type);
CREATE INDEX IF NOT EXISTS idx_credit_balances_expires ON credit_balances(user_id, expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_credit ON subscriptions(next_credit_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active, valid_from, valid_until);

-- 5. PREÇO DINÂMICO (DYNAMIC PRICING)
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=domingo, NULL=todos
  start_time TIME,
  end_time TIME,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00, -- 0.70 = 30% OFF
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- maior = aplica primeiro
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dados iniciais de preço dinâmico
INSERT INTO dynamic_pricing_rules (name, day_of_week, start_time, end_time, multiplier, priority) VALUES
  ('Madrugada OFF', NULL, '00:00', '06:00', 0.70, 10),
  ('Manhã OFF', NULL, '06:00', '12:00', 0.80, 9),
  ('Domingo OFF', 0, NULL, NULL, 0.60, 8),
  ('Noite Normal', NULL, '19:00', '23:59', 1.00, 5)
ON CONFLICT DO NOTHING;

-- 6. RESERVAS COM HOLD DE CRÉDITOS
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS credits_held INTEGER DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS no_show BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 7. HISTÓRICO DETALHADO DE TRANSAÇÕES (estende transactions existente)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS related_id UUID; -- para ligar transações (ex: hold + release)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS related_type TEXT; -- 'reservation_hold', 'reservation_release', 'promo_code', 'referral'

-- 8. FUNÇÕES AUXILIARES

-- Função: Calcular saldo disponível de créditos (considerando expiração)
CREATE OR REPLACE FUNCTION get_available_credits(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM credit_balances
  WHERE user_id = user_uuid
    AND (expires_at IS NULL OR expires_at > now());
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar se código promocional é válido
CREATE OR REPLACE FUNCTION is_promo_code_valid(code_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM promo_codes
    WHERE code = code_text
      AND active = TRUE
      AND valid_from <= now()
      AND (valid_until IS NULL OR valid_until > now())
      AND (max_uses IS NULL OR uses_count < max_uses)
  );
END;
$$ LANGUAGE plpgsql;

-- 9. RLS POLICIES

-- promo_codes: admin lê tudo, usuários só veem códigos ativos via função
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Drop policies existentes (idempotente)
DROP POLICY IF EXISTS "Admins gerenciam tudo" ON promo_codes;
DROP POLICY IF EXISTS "Usuário vê próprios uses" ON promo_code_uses;
DROP POLICY IF EXISTS "Todos veem planos ativos" ON subscription_plans;
DROP POLICY IF EXISTS "Usuário vê própria assinatura" ON subscriptions;
DROP POLICY IF EXISTS "Admins veem todas assinaturas" ON subscriptions;
DROP POLICY IF EXISTS "Usuário vê próprios créditos" ON credit_balances;
DROP POLICY IF EXISTS "Admins gerenciam preços dinâmicos" ON dynamic_pricing_rules;
DROP POLICY IF EXISTS "Todos veem regras ativas" ON dynamic_pricing_rules;

-- Políticas simplificadas (quem pode ver o quê)
CREATE POLICY "Admins gerenciam tudo" ON promo_codes FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
));

CREATE POLICY "Usuário vê próprios uses" ON promo_code_uses FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Todos veem planos ativos" ON subscription_plans FOR SELECT USING (active = TRUE);

CREATE POLICY "Usuário vê própria assinatura" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins veem todas assinaturas" ON subscriptions FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
));

CREATE POLICY "Usuário vê próprios créditos" ON credit_balances FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins gerenciam preços dinâmicos" ON dynamic_pricing_rules FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
));
CREATE POLICY "Todos veem regras ativas" ON dynamic_pricing_rules FOR SELECT USING (active = TRUE);

-- 10. REALTIME (subscriptions precisam de realtime para o cron job)
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_balances;

-- Seeding inicial de planos de assinatura
INSERT INTO subscription_plans (id, name, description, monthly_price, credits_per_month, active) VALUES
  ('basic', 'Wolf Básico', '20 horas por mês', 4990, 1200, TRUE),
  ('gamer', 'Wolf Gamer', '40 horas por mês', 8990, 2400, TRUE),
  ('pro', 'Wolf Pro', '80 horas por mês', 14990, 4800, TRUE)
ON CONFLICT (id) DO NOTHING;
