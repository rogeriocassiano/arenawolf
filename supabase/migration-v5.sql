-- ============================================================
-- ARENA WOLF — Migration v5
-- Apps disponíveis por máquina (launcher personalizado)
-- Execute APÓS migration-v4
-- ============================================================

-- APPS: catálogo global de apps disponíveis na LAN
CREATE TABLE IF NOT EXISTS public.apps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'Jogo' CHECK (category IN ('Jogo','Plataforma','Navegador','Utilitário','Outro')),
  exe_path     TEXT NOT NULL,          -- ex: C:\Program Files (x86)\Steam\steam.exe
  exe_args     TEXT DEFAULT '',        -- argumentos opcionais ex: -applaunch 730
  icon_url     TEXT DEFAULT '',        -- URL de imagem para exibir no launcher
  banner_url   TEXT DEFAULT '',        -- imagem de fundo no card
  sort_order   INTEGER DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MACHINE_APPS: quais apps estão liberados em cada máquina
CREATE TABLE IF NOT EXISTS public.machine_apps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id  UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  app_id      UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(machine_id, app_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_machine_apps_machine ON public.machine_apps(machine_id);
CREATE INDEX IF NOT EXISTS idx_apps_active ON public.apps(active);

-- RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_apps ENABLE ROW LEVEL SECURITY;

-- Drop policies se existirem (idempotente)
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

-- Realtime para o agente receber atualizações de apps em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.apps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_apps;

-- ============================================================
-- Atualizar sessions: adicionar campo login_method
-- ============================================================
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS login_method TEXT DEFAULT 'pin'
  CHECK (login_method IN ('pin', 'credentials'));

-- ============================================================
-- RPC: login com email+senha e iniciar sessão (usado pelo agente)
-- ============================================================
CREATE OR REPLACE FUNCTION public.agent_login(
  p_email      TEXT,
  p_password   TEXT,
  p_machine_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   UUID;
  v_profile   RECORD;
  v_session_id UUID;
BEGIN
  -- Nota: autenticação real via Supabase Auth é feita no cliente
  -- Esta RPC assume que o user_id já foi validado pelo agente via signInWithPassword
  -- Aqui apenas verifica o perfil e cria a sessão
  RETURN jsonb_build_object('error', 'Use o cliente Supabase Auth diretamente');
END;
$$;

-- ============================================================
-- Seed: apps padrão de lan house
-- ============================================================
INSERT INTO public.apps (name, description, category, exe_path, icon_url, sort_order) VALUES
  ('Steam',         'Plataforma de jogos Steam',           'Plataforma',  'C:\Program Files (x86)\Steam\steam.exe',                           'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg', 1),
  ('Epic Games',    'Epic Games Launcher',                  'Plataforma',  'C:\Program Files (x86)\Epic Games\Launcher\Portal\Binaries\Win32\EpicGamesLauncher.exe', 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg', 2),
  ('Battle.net',    'Blizzard Battle.net',                  'Plataforma',  'C:\Program Files (x86)\Battle.net\Battle.net.exe',                 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Battle.net_logo.svg', 3),
  ('CS2',           'Counter-Strike 2',                     'Jogo',        'C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\cs2.exe', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 4),
  ('Valorant',      'Valorant',                             'Jogo',        'C:\Riot Games\VALORANT\live\VALORANT.exe',                          'https://playvalorant.com/static/images/social-share.jpg', 5),
  ('League of Legends', 'League of Legends',               'Jogo',        'C:\Riot Games\League of Legends\LeagueClient.exe',                  'https://www.leagueoflegends.com/static/open-graph-b580f2e72fa3ea8217db26e5b4c85520.jpg', 6),
  ('Google Chrome', 'Navegador Chrome',                     'Navegador',   'C:\Program Files\Google\Chrome\Application\chrome.exe',            'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg', 7),
  ('Discord',       'Discord',                              'Utilitário',  'C:\Users\%USERNAME%\AppData\Local\Discord\Update.exe --processStart Discord.exe', 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', 8)
ON CONFLICT DO NOTHING;
