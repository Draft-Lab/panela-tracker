-- Migration 005: Add Seasons System
-- Purpose: Introduce manual "seasons" that group automatic gaming sessions

-- ============================================
-- 1. Create seasons table
-- ============================================
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_ended_after_started 
    CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Only one active season per game at a time
CREATE UNIQUE INDEX idx_seasons_active_game 
  ON public.seasons(game_id) 
  WHERE is_active = true;

-- Performance indexes
CREATE INDEX idx_seasons_game_id ON public.seasons(game_id);
CREATE INDEX idx_seasons_dates ON public.seasons(started_at, ended_at);
CREATE INDEX idx_seasons_active ON public.seasons(is_active) WHERE is_active = true;

-- ============================================
-- 2. Create season_participants table
-- ============================================
CREATE TABLE IF NOT EXISTS public.season_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  
  -- Final status (set manually when season ends)
  status TEXT CHECK (status IN ('Dropo', 'Zero', 'Dava pra jogar', 'Em andamento')),
  
  -- Consolidated metrics (calculated automatically from jogatinas)
  total_sessions INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  solo_duration_minutes INTEGER DEFAULT 0,
  group_duration_minutes INTEGER DEFAULT 0,
  
  -- Manual notes about participation
  notes TEXT,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(season_id, player_id)
);

-- Performance indexes
CREATE INDEX idx_season_participants_season ON public.season_participants(season_id);
CREATE INDEX idx_season_participants_player ON public.season_participants(player_id);
CREATE INDEX idx_season_participants_status ON public.season_participants(status);

-- ============================================
-- 3. Add season_id to jogatinas (sessions)
-- ============================================
ALTER TABLE public.jogatinas 
  ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;

CREATE INDEX idx_jogatinas_season_id ON public.jogatinas(season_id);

-- ============================================
-- 4. Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_participants ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public access for now)
CREATE POLICY "Allow public read access on seasons"
  ON public.seasons FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on seasons"
  ON public.seasons FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on seasons"
  ON public.seasons FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on seasons"
  ON public.seasons FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on season_participants"
  ON public.season_participants FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on season_participants"
  ON public.season_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on season_participants"
  ON public.season_participants FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on season_participants"
  ON public.season_participants FOR DELETE
  USING (true);
