-- ============================================================
-- FIX: Recursão infinita nas políticas RLS de profiles
-- A solução é usar funções SECURITY DEFINER que ignoram RLS
-- ============================================================

-- Funções helper (SECURITY DEFINER = bypassa RLS, sem recursão)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- Recriar políticas recursivas usando as funções
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "Admin/staff can view all profiles" ON public.profiles;
CREATE POLICY "Admin/staff can view all profiles" ON public.profiles FOR SELECT USING (public.is_staff());

-- MACHINES
DROP POLICY IF EXISTS "Admin/staff can modify machines" ON public.machines;
CREATE POLICY "Admin/staff can modify machines" ON public.machines FOR ALL USING (public.is_staff());

-- RESERVATIONS
DROP POLICY IF EXISTS "Admin/staff can view all reservations" ON public.reservations;
CREATE POLICY "Admin/staff can view all reservations" ON public.reservations FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Admin/staff can modify all reservations" ON public.reservations;
CREATE POLICY "Admin/staff can modify all reservations" ON public.reservations FOR ALL USING (public.is_staff());

-- TRANSACTIONS
DROP POLICY IF EXISTS "Admin can view all transactions" ON public.transactions;
CREATE POLICY "Admin can view all transactions" ON public.transactions FOR SELECT USING (public.is_staff());

-- PRODUCTS
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (public.is_staff());

-- EVENTS
DROP POLICY IF EXISTS "Admin can manage events" ON public.events;
CREATE POLICY "Admin can manage events" ON public.events FOR ALL USING (public.is_staff());

-- RANKINGS
DROP POLICY IF EXISTS "Admin can manage rankings" ON public.rankings;
CREATE POLICY "Admin can manage rankings" ON public.rankings FOR ALL USING (public.is_staff());

-- SUPPORT
DROP POLICY IF EXISTS "Admin can view all tickets" ON public.support_tickets;
CREATE POLICY "Admin can view all tickets" ON public.support_tickets FOR SELECT USING (public.is_staff());
DROP POLICY IF EXISTS "Admin can update tickets" ON public.support_tickets;
CREATE POLICY "Admin can update tickets" ON public.support_tickets FOR UPDATE USING (public.is_staff());
DROP POLICY IF EXISTS "Admin can view all messages" ON public.support_messages;
CREATE POLICY "Admin can view all messages" ON public.support_messages FOR SELECT USING (public.is_staff());

-- MARKETING
DROP POLICY IF EXISTS "Admin can manage marketing" ON public.marketing_connections;
CREATE POLICY "Admin can manage marketing" ON public.marketing_connections FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admin can manage campaigns" ON public.marketing_campaigns;
CREATE POLICY "Admin can manage campaigns" ON public.marketing_campaigns FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admin can manage assets" ON public.marketing_assets;
CREATE POLICY "Admin can manage assets" ON public.marketing_assets FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admin can manage calendar" ON public.marketing_calendar;
CREATE POLICY "Admin can manage calendar" ON public.marketing_calendar FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admin can manage AI convos" ON public.ai_conversations;
CREATE POLICY "Admin can manage AI convos" ON public.ai_conversations FOR ALL USING (public.is_admin());
