-- ============================================================
-- ARENA WOLF — Migration v3
-- Corrige inconsistências entre schema.sql e migration-v2
-- Execute no SQL Editor do Supabase APÓS migration-v2
-- ============================================================

-- 1. PRODUCTS — adicionar colunas faltando
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Outro';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- 2. MARKETING CAMPAIGNS — remover CHECK constraint restritivo de platform
--    (o schema original tem CHECK IN ('meta','google') mas usamos texto livre)
ALTER TABLE public.marketing_campaigns DROP CONSTRAINT IF EXISTS marketiang_campaigns_platform_check;
-- Garantir que a coluna existe sem constraint
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS name TEXT;
-- Copiar name para title se existir
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketing_campaigns' AND column_name='name') THEN
    UPDATE public.marketing_campaigns SET name = name WHERE name IS NOT NULL;
  END IF;
END $$;

-- 3. MARKETING ASSETS — tornar url opcional (copy não tem URL)
ALTER TABLE public.marketing_assets ALTER COLUMN url DROP NOT NULL;
-- Remover CHECK constraint de type (schema tem apenas image/video/template, mas usamos copy também)
ALTER TABLE public.marketing_assets DROP CONSTRAINT IF EXISTS marketing_assets_type_check;
-- Adicionar colunas faltando
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.marketing_assets ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 4. PROMOTIONS — unificar schema antigo com novo
--    Schema original: discount_type, value. Novo: type, discount_value
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'discount_percent';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS min_purchase NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS max_uses INTEGER;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
-- Remover CHECK constraints restritivas do schema antigo
ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_discount_type_check;
-- Migrar dados antigos para novo formato se existirem
UPDATE public.promotions
SET type = CASE discount_type
  WHEN 'percent' THEN 'discount_percent'
  WHEN 'fixed' THEN 'discount_fixed'
  WHEN 'minutes' THEN 'bonus_time'
  ELSE 'discount_percent'
END,
discount_value = COALESCE(value, 0)
WHERE type = 'discount_percent' AND discount_value = 0 AND discount_type IS NOT NULL;

-- 5. MARKETING CALENDAR — adicionar colunas faltando
ALTER TABLE public.marketing_calendar ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.marketing_calendar ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'Post';
-- Remover CHECK restritivo de status se existir
ALTER TABLE public.marketing_calendar DROP CONSTRAINT IF EXISTS marketing_calendar_status_check;

-- 6. EVENTS — garantir coluna type sem CHECK restritivo (schema tem CHECK mas podemos ter novos tipos)
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE public.events ADD CONSTRAINT events_type_check CHECK (type IN ('corujao', 'campeonato', 'evento'));

-- 7. RLS para promotions (pode não ter sido criado)
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;
CREATE POLICY "Anyone can view active promotions" ON public.promotions
  FOR SELECT TO authenticated USING (active = TRUE);
DROP POLICY IF EXISTS "Admin can manage promotions" ON public.promotions;
CREATE POLICY "Admin can manage promotions" ON public.promotions
  FOR ALL USING (public.is_staff());

-- 8. RLS para products (garantir admin pode fazer tudo)
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products
  FOR ALL USING (public.is_staff());
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT TO authenticated USING (active = TRUE OR public.is_staff());

-- 9. RLS para marketing_assets
DROP POLICY IF EXISTS "Admin can manage assets" ON public.marketing_assets;
CREATE POLICY "Admin can manage assets" ON public.marketing_assets
  FOR ALL USING (public.is_staff());

-- 10. RLS para marketing_campaigns
DROP POLICY IF EXISTS "Admin can manage campaigns" ON public.marketing_campaigns;
CREATE POLICY "Admin can manage campaigns" ON public.marketing_campaigns
  FOR ALL USING (public.is_staff());

-- 11. RLS para marketing_calendar
DROP POLICY IF EXISTS "Admin can manage calendar" ON public.marketing_calendar;
CREATE POLICY "Admin can manage calendar" ON public.marketing_calendar
  FOR ALL USING (public.is_staff());

-- 12. Seed de produtos com categoria (se não existirem)
INSERT INTO public.products (name, price, stock, category, active) VALUES
  ('Água Mineral 500ml', 3.00, 50, 'Bebida', TRUE),
  ('Energético 473ml',   8.00, 30, 'Bebida', TRUE),
  ('Refrigerante Lata',  5.00, 40, 'Bebida', TRUE),
  ('Chips',              4.00, 25, 'Snack',  TRUE),
  ('Amendoim',           4.00, 20, 'Snack',  TRUE),
  ('Cup Noodles',        6.00, 15, 'Snack',  TRUE)
ON CONFLICT DO NOTHING;

-- 13. (Dados de eventos e promoções devem ser cadastrados pelo painel admin em produção)
