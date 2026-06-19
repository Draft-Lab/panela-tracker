-- Admin allowlist: replace USING(true) write policies with is_admin() checks
-- Prerequisite: run scripts/009_tighten_rls_for_auth.sql first
-- After this script, seed your admin user (see bottom of file)

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- players
DROP POLICY IF EXISTS "Authenticated users can insert on players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can update on players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can delete on players" ON public.players;

CREATE POLICY "Admin users can insert on players"
  ON public.players FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on players"
  ON public.players FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on players"
  ON public.players FOR DELETE TO authenticated
  USING (public.is_admin());

-- games
DROP POLICY IF EXISTS "Authenticated users can insert on games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can update on games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can delete on games" ON public.games;

CREATE POLICY "Admin users can insert on games"
  ON public.games FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on games"
  ON public.games FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on games"
  ON public.games FOR DELETE TO authenticated
  USING (public.is_admin());

-- jogatinas
DROP POLICY IF EXISTS "Authenticated users can insert on jogatinas" ON public.jogatinas;
DROP POLICY IF EXISTS "Authenticated users can update on jogatinas" ON public.jogatinas;
DROP POLICY IF EXISTS "Authenticated users can delete on jogatinas" ON public.jogatinas;

CREATE POLICY "Admin users can insert on jogatinas"
  ON public.jogatinas FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on jogatinas"
  ON public.jogatinas FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on jogatinas"
  ON public.jogatinas FOR DELETE TO authenticated
  USING (public.is_admin());

-- jogatina_players
DROP POLICY IF EXISTS "Authenticated users can insert on jogatina_players" ON public.jogatina_players;
DROP POLICY IF EXISTS "Authenticated users can update on jogatina_players" ON public.jogatina_players;
DROP POLICY IF EXISTS "Authenticated users can delete on jogatina_players" ON public.jogatina_players;

CREATE POLICY "Admin users can insert on jogatina_players"
  ON public.jogatina_players FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on jogatina_players"
  ON public.jogatina_players FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on jogatina_players"
  ON public.jogatina_players FOR DELETE TO authenticated
  USING (public.is_admin());

-- jogatina_events
DROP POLICY IF EXISTS "Authenticated users can insert on jogatina_events" ON public.jogatina_events;
DROP POLICY IF EXISTS "Authenticated users can update on jogatina_events" ON public.jogatina_events;
DROP POLICY IF EXISTS "Authenticated users can delete on jogatina_events" ON public.jogatina_events;

CREATE POLICY "Admin users can insert on jogatina_events"
  ON public.jogatina_events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on jogatina_events"
  ON public.jogatina_events FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on jogatina_events"
  ON public.jogatina_events FOR DELETE TO authenticated
  USING (public.is_admin());

-- seasons
DROP POLICY IF EXISTS "Authenticated users can insert on seasons" ON public.seasons;
DROP POLICY IF EXISTS "Authenticated users can update on seasons" ON public.seasons;
DROP POLICY IF EXISTS "Authenticated users can delete on seasons" ON public.seasons;

CREATE POLICY "Admin users can insert on seasons"
  ON public.seasons FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on seasons"
  ON public.seasons FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on seasons"
  ON public.seasons FOR DELETE TO authenticated
  USING (public.is_admin());

-- season_participants
DROP POLICY IF EXISTS "Authenticated users can insert on season_participants" ON public.season_participants;
DROP POLICY IF EXISTS "Authenticated users can update on season_participants" ON public.season_participants;
DROP POLICY IF EXISTS "Authenticated users can delete on season_participants" ON public.season_participants;

CREATE POLICY "Admin users can insert on season_participants"
  ON public.season_participants FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on season_participants"
  ON public.season_participants FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on season_participants"
  ON public.season_participants FOR DELETE TO authenticated
  USING (public.is_admin());

-- Seed first admin (run manually after creating user in Authentication):
-- INSERT INTO public.admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'seu@email.com';
