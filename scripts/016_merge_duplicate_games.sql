-- Migration 016: prevent duplicate games by normalized title.
--
-- Scope: DATABASE RULE ONLY. This migration is NON-DESTRUCTIVE — it never
-- merges, moves, deactivates or deletes existing rows. It adds:
--   1. the `normalize_game_title` helper (mirrors lib/discord/game-title.ts);
--   2. a unique index that stops a second game from being created for the same
--      normalized title (the Discord bot used `.single()` on the non-unique
--      `games.title`, which produced one game per event);
--   3. a defensive check that enables RLS on any public table missing it.
--
-- Pre-existing duplicates are NOT touched. If any remain, the unique index is
-- skipped with a notice instead of failing, so the file always runs to
-- completion without changing data. Use the read-only query at the end to list
-- them and resolve them manually, then re-run this file.

-- ============================================
-- 1. Immutable normalizer (mirrors lib/discord/game-title.ts)
-- ============================================
CREATE OR REPLACE FUNCTION public.normalize_game_title(p_title TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT btrim(
    regexp_replace(
      translate(
        lower(p_title),
        'áàâãäåéèêëíìîïóòôõöúùûüçñ',
        'aaaaaaeeeeiiiiooooouuuucn'
      ),
      '[^a-z0-9]+', ' ', 'g'
    )
  );
$$;

REVOKE ALL ON FUNCTION public.normalize_game_title(TEXT) FROM PUBLIC;

-- ============================================
-- 2. Rule: at most one game per normalized title
--    Symbol/emoji-only titles normalize to '' and are keyed by id, so they
--    never collide with each other or with real titles.
-- ============================================
DO $$
DECLARE
  duplicate_count integer;
BEGIN
  SELECT count(*) INTO duplicate_count
  FROM (
    SELECT COALESCE(NULLIF(public.normalize_game_title(title), ''), id::text)
    FROM public.games
    GROUP BY 1
    HAVING count(*) > 1
  ) dupes;

  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Skipped idx_games_normalized_title: % normalized title(s) still have duplicates. Resolve them (read-only query at the end of this file) and re-run migration 016.', duplicate_count;
  ELSE
    EXECUTE $idx$
      CREATE UNIQUE INDEX IF NOT EXISTS idx_games_normalized_title
        ON public.games (
          COALESCE(NULLIF(public.normalize_game_title(title), ''), id::text)
        )
    $idx$;
    RAISE NOTICE 'Created idx_games_normalized_title.';
  END IF;
END $$;

-- ============================================
-- 3. Safety: enable RLS on any public table that still has it disabled.
--    Non-destructive and idempotent (a no-op when RLS is already enabled).
-- ============================================
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);
    RAISE NOTICE 'Enabled RLS on public.%', r.relname;
  END LOOP;
END $$;

-- ============================================
-- READ-ONLY helper — safe to run any time.
-- Lists duplicate normalized titles so you can resolve them manually.
-- ============================================
-- SELECT
--   COALESCE(NULLIF(public.normalize_game_title(title), ''), id::text) AS normalized_key,
--   count(*) AS games,
--   array_agg(title ORDER BY created_at) AS titles,
--   array_agg(id ORDER BY created_at) AS game_ids
-- FROM public.games
-- GROUP BY 1
-- HAVING count(*) > 1
-- ORDER BY games DESC;
