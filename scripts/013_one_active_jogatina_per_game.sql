-- Migration 013: Enforce one active discord_bot jogatina per game
-- Fixes race condition when two players start the same game at the same time

-- ============================================
-- 1. Merge existing duplicate active sessions
-- ============================================

-- Staging table: canonical vs duplicate ids
CREATE TEMP TABLE _dup_jogatinas AS
WITH ranked AS (
  SELECT
    id,
    game_id,
    ROW_NUMBER() OVER (
      PARTITION BY game_id
      ORDER BY COALESCE(first_event_at, date) ASC NULLS LAST, id ASC
    ) AS rn
  FROM public.jogatinas
  WHERE is_current = true
    AND source = 'discord_bot'
)
SELECT
  r.id AS dupe_id,
  c.id AS canonical_id
FROM ranked r
JOIN ranked c
  ON c.game_id = r.game_id
 AND c.rn = 1
WHERE r.rn > 1;

-- Move players missing on the canonical session
INSERT INTO public.jogatina_players (jogatina_id, player_id, status, is_active)
SELECT
  d.canonical_id,
  jp.player_id,
  COALESCE(jp.status, 'Jogatina'),
  jp.is_active
FROM _dup_jogatinas d
JOIN public.jogatina_players jp ON jp.jogatina_id = d.dupe_id
WHERE NOT EXISTS (
  SELECT 1
  FROM public.jogatina_players existing
  WHERE existing.jogatina_id = d.canonical_id
    AND existing.player_id = jp.player_id
)
ON CONFLICT (jogatina_id, player_id) DO NOTHING;

-- Activate on canonical when the player was active only on the duplicate
UPDATE public.jogatina_players AS canonical_jp
SET is_active = true
FROM _dup_jogatinas d
JOIN public.jogatina_players dupe_jp
  ON dupe_jp.jogatina_id = d.dupe_id
 AND dupe_jp.is_active = true
WHERE canonical_jp.jogatina_id = d.canonical_id
  AND canonical_jp.player_id = dupe_jp.player_id
  AND canonical_jp.is_active = false;

-- Deactivate players still active on duplicate sessions
UPDATE public.jogatina_players jp
SET is_active = false
FROM _dup_jogatinas d
WHERE jp.jogatina_id = d.dupe_id
  AND jp.is_active = true;

-- Close duplicate jogatinas
UPDATE public.jogatinas j
SET
  is_current = false,
  active_players = 0,
  last_event_at = COALESCE(j.last_event_at, NOW()),
  notes = CASE
    WHEN j.notes IS NULL OR j.notes = '' THEN
      'Sessão duplicada fechada pela migration 013 (merge)'
    ELSE
      j.notes || ' | Sessão duplicada fechada pela migration 013 (merge)'
  END
FROM _dup_jogatinas d
WHERE j.id = d.dupe_id;

-- Refresh counters on surviving active bot sessions
UPDATE public.jogatinas j
SET
  active_players = counts.active_count,
  session_type = CASE WHEN counts.active_count > 1 THEN 'group' ELSE 'solo' END
FROM (
  SELECT
    j2.id AS jogatina_id,
    COUNT(jp.id) FILTER (WHERE jp.is_active = true) AS active_count
  FROM public.jogatinas j2
  LEFT JOIN public.jogatina_players jp ON jp.jogatina_id = j2.id
  WHERE j2.is_current = true
    AND j2.source = 'discord_bot'
  GROUP BY j2.id
) counts
WHERE j.id = counts.jogatina_id;

DROP TABLE _dup_jogatinas;

-- ============================================
-- 2. Unique partial index — one active bot session per game
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_jogatina_per_game
  ON public.jogatinas (game_id)
  WHERE is_current = true AND source = 'discord_bot';
