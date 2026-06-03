-- ============================================================
-- ARENA WOLF — Migration v7
-- Suporte a ligar/desligar PCs remotamente
-- Execute no SQL Editor do Supabase APÓS migration-v6
-- ============================================================

-- 1. Adicionar mac_address para Wake-on-LAN
ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS mac_address TEXT DEFAULT NULL;

-- 2. Adicionar flag de shutdown solicitado (agente monitora via Realtime)
ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS shutdown_requested BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Garantir machines no Realtime (agente precisa escutar shutdown_requested)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'machines'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
  END IF;
END $$;
