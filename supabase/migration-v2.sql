-- ============================================================
-- ARENA WOLF — Migration v2
-- Novas tabelas: teams, team_members, tournaments, 
--                tournament_participants, user_bans
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Adicionar coluna banned em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  tag         TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  game        TEXT NOT NULL,
  captain_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id    UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('captain', 'player', 'sub')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

-- TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  game          TEXT NOT NULL,
  format        TEXT NOT NULL DEFAULT 'single_elimination' CHECK (format IN ('single_elimination','double_elimination','round_robin','swiss')),
  type          TEXT NOT NULL DEFAULT 'solo' CHECK (type IN ('solo','team')),
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','finished','cancelled')),
  max_slots     INTEGER NOT NULL DEFAULT 16,
  slots_taken   INTEGER NOT NULL DEFAULT 0,
  prize_pool    TEXT,
  entry_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_at      TIMESTAMPTZ NOT NULL,
  rules         TEXT NOT NULL DEFAULT '',
  image_url     TEXT,
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TOURNAMENT PARTICIPANTS (solo ou time)
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id       UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  seed          INTEGER,
  status        TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','confirmed','eliminated','winner')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, user_id),
  UNIQUE (tournament_id, team_id)
);

-- TOURNAMENT MATCHES
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round           INTEGER NOT NULL,
  match_number    INTEGER NOT NULL,
  participant_a   UUID REFERENCES public.tournament_participants(id),
  participant_b   UUID REFERENCES public.tournament_participants(id),
  winner          UUID REFERENCES public.tournament_participants(id),
  score_a         INTEGER DEFAULT 0,
  score_b         INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','finished','bye')),
  scheduled_at    TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- POLICIES (idempotentes — DROP IF EXISTS antes de criar)
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Captain can manage team" ON public.teams;
DROP POLICY IF EXISTS "Admin can manage teams" ON public.teams;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Captain can manage team" ON public.teams FOR ALL USING (auth.uid() = captain_id);
CREATE POLICY "Admin can manage teams" ON public.teams FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Captain can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Admin can manage team members" ON public.team_members;
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Captain can manage members" ON public.team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);
CREATE POLICY "Admin can manage team members" ON public.team_members FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admin can manage tournaments" ON public.tournaments;
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage tournaments" ON public.tournaments FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Anyone can view participants" ON public.tournament_participants;
DROP POLICY IF EXISTS "Users can register" ON public.tournament_participants;
DROP POLICY IF EXISTS "Admin can manage participants" ON public.tournament_participants;
CREATE POLICY "Anyone can view participants" ON public.tournament_participants FOR SELECT USING (TRUE);
CREATE POLICY "Users can register" ON public.tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage participants" ON public.tournament_participants FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Anyone can view matches" ON public.tournament_matches;
DROP POLICY IF EXISTS "Admin can manage matches" ON public.tournament_matches;
CREATE POLICY "Anyone can view matches" ON public.tournament_matches FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage matches" ON public.tournament_matches FOR ALL USING (public.is_staff());

-- Realtime para torneios
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;

-- RPC: incrementar slots_taken atomicamente
CREATE OR REPLACE FUNCTION public.increment_slots_taken(tournament_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.tournaments
  SET slots_taken = slots_taken + 1
  WHERE id = tournament_id AND slots_taken < max_slots;
$$;

-- Adicionar colunas que podem estar faltando na tabela promotions
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'discount_percent';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS min_purchase NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS valid_from DATE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS max_uses INTEGER;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS budget NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS target_audience TEXT;

-- Adicionar colunas que podem estar faltando em marketing_campaigns
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS budget NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS description TEXT;

-- Adicionar colunas que podem estar faltando em marketing_calendar
ALTER TABLE public.marketing_calendar ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.marketing_calendar ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'Post';
ALTER TABLE public.marketing_calendar ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.marketing_calendar ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Adicionar colunas que podem estar faltando em marketing_assets  
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image';
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS title TEXT;
