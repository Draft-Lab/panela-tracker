-- Tighten RLS: public read, authenticated write only
-- Run after enabling Supabase Auth for admin users

-- players
DROP POLICY IF EXISTS "Allow public insert on players" ON public.players;
DROP POLICY IF EXISTS "Allow public update on players" ON public.players;
DROP POLICY IF EXISTS "Allow public delete on players" ON public.players;

CREATE POLICY "Authenticated users can insert on players"
  ON public.players FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on players"
  ON public.players FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on players"
  ON public.players FOR DELETE TO authenticated
  USING (true);

-- games
DROP POLICY IF EXISTS "Allow public insert on games" ON public.games;
DROP POLICY IF EXISTS "Allow public update on games" ON public.games;
DROP POLICY IF EXISTS "Allow public delete on games" ON public.games;

CREATE POLICY "Authenticated users can insert on games"
  ON public.games FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on games"
  ON public.games FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on games"
  ON public.games FOR DELETE TO authenticated
  USING (true);

-- jogatinas
DROP POLICY IF EXISTS "Allow public insert on jogatinas" ON public.jogatinas;
DROP POLICY IF EXISTS "Allow public update on jogatinas" ON public.jogatinas;
DROP POLICY IF EXISTS "Allow public delete on jogatinas" ON public.jogatinas;

CREATE POLICY "Authenticated users can insert on jogatinas"
  ON public.jogatinas FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on jogatinas"
  ON public.jogatinas FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on jogatinas"
  ON public.jogatinas FOR DELETE TO authenticated
  USING (true);

-- jogatina_players
DROP POLICY IF EXISTS "Allow public insert on jogatina_players" ON public.jogatina_players;
DROP POLICY IF EXISTS "Allow public update on jogatina_players" ON public.jogatina_players;
DROP POLICY IF EXISTS "Allow public delete on jogatina_players" ON public.jogatina_players;

CREATE POLICY "Authenticated users can insert on jogatina_players"
  ON public.jogatina_players FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on jogatina_players"
  ON public.jogatina_players FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on jogatina_players"
  ON public.jogatina_players FOR DELETE TO authenticated
  USING (true);

-- jogatina_events
DROP POLICY IF EXISTS "Allow public insert on jogatina_events" ON public.jogatina_events;
DROP POLICY IF EXISTS "Allow public update on jogatina_events" ON public.jogatina_events;
DROP POLICY IF EXISTS "Allow public delete on jogatina_events" ON public.jogatina_events;

CREATE POLICY "Authenticated users can insert on jogatina_events"
  ON public.jogatina_events FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on jogatina_events"
  ON public.jogatina_events FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on jogatina_events"
  ON public.jogatina_events FOR DELETE TO authenticated
  USING (true);

-- seasons
DROP POLICY IF EXISTS "Allow public insert on seasons" ON public.seasons;
DROP POLICY IF EXISTS "Allow public update on seasons" ON public.seasons;
DROP POLICY IF EXISTS "Allow public delete on seasons" ON public.seasons;

CREATE POLICY "Authenticated users can insert on seasons"
  ON public.seasons FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on seasons"
  ON public.seasons FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on seasons"
  ON public.seasons FOR DELETE TO authenticated
  USING (true);

-- season_participants
DROP POLICY IF EXISTS "Allow public insert on season_participants" ON public.season_participants;
DROP POLICY IF EXISTS "Allow public update on season_participants" ON public.season_participants;
DROP POLICY IF EXISTS "Allow public delete on season_participants" ON public.season_participants;

CREATE POLICY "Authenticated users can insert on season_participants"
  ON public.season_participants FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update on season_participants"
  ON public.season_participants FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete on season_participants"
  ON public.season_participants FOR DELETE TO authenticated
  USING (true);
