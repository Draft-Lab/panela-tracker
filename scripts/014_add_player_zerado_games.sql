-- Player zerado (beaten) games tracking
-- Prerequisite: scripts/010_admin_users_rls.sql (is_admin function)

CREATE TABLE IF NOT EXISTS public.player_zerado_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (player_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_player_zerado_player_id
  ON public.player_zerado_games (player_id);

ALTER TABLE public.player_zerado_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on player_zerado_games"
  ON public.player_zerado_games FOR SELECT
  USING (true);

CREATE POLICY "Admin users can insert on player_zerado_games"
  ON public.player_zerado_games FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update on player_zerado_games"
  ON public.player_zerado_games FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can delete on player_zerado_games"
  ON public.player_zerado_games FOR DELETE TO authenticated
  USING (public.is_admin());
