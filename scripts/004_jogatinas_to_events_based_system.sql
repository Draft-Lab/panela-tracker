-- Migration 004: Migrate jogatinas to event-based system

-- Create jogatina_events table
CREATE TABLE IF NOT EXISTS public.jogatina_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jogatina_id UUID NOT NULL REFERENCES public.jogatinas(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('player_joined', 'player_left')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jogatina_events_jogatina_id ON public.jogatina_events(jogatina_id);
CREATE INDEX IF NOT EXISTS idx_jogatina_events_player_id ON public.jogatina_events(player_id);
CREATE INDEX IF NOT EXISTS idx_jogatina_events_timestamp ON public.jogatina_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_jogatina_events_type ON public.jogatina_events(event_type);

-- Add new columns to jogatinas table
ALTER TABLE public.jogatinas 
  ADD COLUMN IF NOT EXISTS first_event_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS active_players INTEGER DEFAULT 0;

-- Update existing jogatinas to mark them as completed (from old system)
UPDATE public.jogatinas 
SET is_current = false,
    source = COALESCE(source, 'manual')
WHERE is_current IS NULL OR source IS NULL;

-- Enable RLS on new table
ALTER TABLE public.jogatina_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on jogatina_events"
  ON public.jogatina_events;

CREATE POLICY "Allow public read access on jogatina_events"
  ON public.jogatina_events
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert on jogatina_events"
  ON public.jogatina_events;

CREATE POLICY "Allow public insert on jogatina_events"
  ON public.jogatina_events
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on jogatina_events"
  ON public.jogatina_events;

CREATE POLICY "Allow public update on jogatina_events"
  ON public.jogatina_events
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow public delete on jogatina_events"
  ON public.jogatina_events;

CREATE POLICY "Allow public delete on jogatina_events"
  ON public.jogatina_events
  FOR DELETE
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.jogatina_events IS 'Registra todos os eventos de entrada e saída de jogadores nas jogatinas';
COMMENT ON COLUMN public.jogatina_events.event_type IS 'Tipo do evento: player_joined (jogador entrou) ou player_left (jogador saiu)';
COMMENT ON COLUMN public.jogatina_events.timestamp IS 'Timestamp exato do evento';
COMMENT ON COLUMN public.jogatinas.first_event_at IS 'Timestamp do primeiro evento da jogatina';
COMMENT ON COLUMN public.jogatinas.last_event_at IS 'Timestamp do último evento da jogatina';
COMMENT ON COLUMN public.jogatinas.total_duration_minutes IS 'Duração total da jogatina em minutos (calculado)';
COMMENT ON COLUMN public.jogatinas.active_players IS 'Número de jogadores atualmente ativos na jogatina';

-- Remove old columns that are no longer needed (optional, commented for safety)
-- ALTER TABLE public.jogatinas DROP COLUMN IF EXISTS started_at;
-- ALTER TABLE public.jogatinas DROP COLUMN IF EXISTS ended_at;
-- ALTER TABLE public.jogatinas DROP COLUMN IF EXISTS duration_minutes;

-- Add is_active column to jogatina_players to track currently active players
ALTER TABLE public.jogatina_players 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS solo_duration_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS group_duration_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_jogatina_players_is_active ON public.jogatina_players(is_active) WHERE is_active = true;

-- Add comments
COMMENT ON COLUMN public.jogatina_players.is_active IS 'Indica se o jogador está atualmente ativo na jogatina (true) ou já saiu (false)';
COMMENT ON COLUMN public.jogatina_players.solo_duration_minutes IS 'Tempo total jogado sozinho (calculado ao finalizar)';
COMMENT ON COLUMN public.jogatina_players.group_duration_minutes IS 'Tempo total jogado em grupo (calculado ao finalizar)';
COMMENT ON COLUMN public.jogatina_players.total_duration_minutes IS 'Tempo total jogado (solo + grupo)';

