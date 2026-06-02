-- ============================================================
-- ARENA WOLF — Schema Supabase PostgreSQL
-- Execute no SQL Editor do Supabase (Project > SQL Editor)
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extensão do auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT NOT NULL UNIQUE,
  avatar_url  TEXT,
  credits_minutes INTEGER NOT NULL DEFAULT 0,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MACHINES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.machines (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL UNIQUE,
  type           TEXT NOT NULL CHECK (type IN ('pc', 'ps5')),
  status         TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'busy', 'reserved', 'maintenance')),
  price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  machine_id   UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'finished', 'cancelled')),
  paid_via     TEXT,
  total_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    machine_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status IN ('pending', 'active'))
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('credit_purchase', 'reservation', 'product', 'refund')),
  amount      INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROMOTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'minutes', 'fixed')),
  value         NUMERIC(10,2) NOT NULL,
  valid_from    TIMESTAMPTZ NOT NULL,
  valid_until   TIMESTAMPTZ NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                     TEXT NOT NULL,
  type                      TEXT NOT NULL CHECK (type IN ('corujao', 'campeonato', 'evento')),
  description               TEXT NOT NULL DEFAULT '',
  start_at                  TIMESTAMPTZ NOT NULL,
  end_at                    TIMESTAMPTZ NOT NULL,
  price                     NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_slots                 INTEGER NOT NULL DEFAULT 10,
  slots_taken               INTEGER NOT NULL DEFAULT 0,
  requires_advance_payment  BOOLEAN NOT NULL DEFAULT FALSE,
  active                    BOOLEAN NOT NULL DEFAULT TRUE,
  image_url                 TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENT REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  paid        BOOLEAN NOT NULL DEFAULT FALSE,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- ============================================================
-- RANKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rankings (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game     TEXT NOT NULL,
  user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points   INTEGER NOT NULL DEFAULT 0,
  season   TEXT NOT NULL DEFAULT '2025-S1',
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE (game, user_id, season)
);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPORT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id  UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MARKETING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketing_connections (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform          TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  access_token_enc  TEXT,
  refresh_token_enc TEXT,
  account_id        TEXT,
  status            TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'expired')),
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform        TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  campaign_id_ext TEXT,
  name            TEXT NOT NULL,
  objective       TEXT NOT NULL DEFAULT 'awareness',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'finished')),
  budget_daily    NUMERIC(10,2),
  budget_total    NUMERIC(10,2),
  start_date      DATE,
  end_date        DATE,
  spent           NUMERIC(10,2) NOT NULL DEFAULT 0,
  impressions     INTEGER NOT NULL DEFAULT 0,
  clicks          INTEGER NOT NULL DEFAULT 0,
  conversions     INTEGER NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_assets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  url        TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('image', 'video', 'template')),
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_calendar (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  platform     TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'promoted')),
  creative_id  UUID REFERENCES public.marketing_assets(id),
  campaign_id  UUID REFERENCES public.marketing_campaigns(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context    TEXT NOT NULL DEFAULT 'marketing' CHECK (context IN ('marketing', 'support')),
  messages   JSONB NOT NULL DEFAULT '[]',
  model      TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED: Máquinas
-- ============================================================
INSERT INTO public.machines (name, type, status, price_per_hour) VALUES
  ('Wolf 01', 'pc',  'free', 10.00),
  ('Wolf 02', 'pc',  'free', 10.00),
  ('Wolf 03', 'pc',  'free', 10.00),
  ('Wolf 04', 'pc',  'free', 10.00),
  ('Wolf 05', 'pc',  'free', 10.00),
  ('Wolf 06', 'pc',  'free', 10.00),
  ('Wolf 07', 'pc',  'free', 10.00),
  ('Wolf 08', 'pc',  'free', 10.00),
  ('Wolf 09', 'pc',  'free', 10.00),
  ('Wolf 10', 'pc',  'free', 10.00),
  ('PS5 01',  'ps5', 'free', 10.00),
  ('PS5 02',  'ps5', 'free', 10.00),
  ('PS5 03',  'ps5', 'free', 10.00)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Produtos
-- ============================================================
INSERT INTO public.products (name, price, stock, active) VALUES
  ('Água Mineral 500ml', 3.00, 50, TRUE),
  ('Energético 473ml',   8.00, 30, TRUE),
  ('Refrigerante Lata',  5.00, 40, TRUE),
  ('Chips',              4.00, 25, TRUE),
  ('Amendoim',           4.00, 20, TRUE),
  ('Cup Noodles',        6.00, 15, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin/staff can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Machines: todos logados podem ver; só admin/staff pode alterar
CREATE POLICY "Authenticated can view machines" ON public.machines FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin/staff can modify machines" ON public.machines FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Reservations
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON public.reservations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin/staff can view all reservations" ON public.reservations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);
CREATE POLICY "Admin/staff can modify all reservations" ON public.reservations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all transactions" ON public.transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Products: todos veem, admin gerencia
CREATE POLICY "Authenticated can view products" ON public.products FOR SELECT TO authenticated USING (active = TRUE);
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Events: todos veem eventos ativos
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (active = TRUE);
CREATE POLICY "Admin can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Rankings: todos veem
CREATE POLICY "Anyone authenticated can view rankings" ON public.rankings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin can manage rankings" ON public.rankings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Support
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all tickets" ON public.support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);
CREATE POLICY "Admin can update tickets" ON public.support_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);
CREATE POLICY "Users can view messages of own tickets" ON public.support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.support_messages FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admin can view all messages" ON public.support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Marketing: só admin
CREATE POLICY "Admin can manage marketing" ON public.marketing_connections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin can manage campaigns" ON public.marketing_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin can manage assets" ON public.marketing_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin can manage calendar" ON public.marketing_calendar FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin can manage AI convos" ON public.ai_conversations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- REALTIME: habilitar para machines
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, role, credits_minutes)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    'user',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
