-- Enable Supabase Realtime for live lobby (sessions + join/leave)
-- Idempotent: only adds tables missing from the publication

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'jogatinas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jogatinas;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'jogatina_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jogatina_players;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'jogatina_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jogatina_events;
  END IF;
END $$;
