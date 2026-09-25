-- Pontos são concedidos somente quando uma sessão é finalizada após esta migration.
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS points_balance INTEGER NOT NULL DEFAULT 0
  CHECK (points_balance >= 0);

CREATE TABLE IF NOT EXISTS public.player_point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  jogatina_player_id UUID NOT NULL REFERENCES public.jogatina_players(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (jogatina_player_id)
);

CREATE INDEX IF NOT EXISTS idx_player_point_transactions_player_id
  ON public.player_point_transactions(player_id);

ALTER TABLE public.player_point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on player_point_transactions"
  ON public.player_point_transactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert player point transactions"
  ON public.player_point_transactions FOR INSERT TO authenticated
  WITH CHECK (true);

-- Cada participante de uma jogatina pode gerar somente um crédito. O conflito
-- é ignorado para que retries e reprocessamentos não alterem o saldo duas vezes.
CREATE OR REPLACE FUNCTION public.award_jogatina_points(p_jogatina_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_awarded_points INTEGER := 0;
BEGIN
  WITH inserted_transactions AS (
    INSERT INTO public.player_point_transactions (
      player_id,
      jogatina_player_id,
      points
    )
    SELECT
      jp.player_id,
      jp.id,
      GREATEST(COALESCE(jp.total_duration_minutes, 0), 0)
    FROM public.jogatina_players jp
    WHERE jp.jogatina_id = p_jogatina_id
      AND COALESCE(jp.total_duration_minutes, 0) > 0
    ON CONFLICT (jogatina_player_id) DO NOTHING
    RETURNING player_id, points
  ), player_totals AS (
    SELECT player_id, SUM(points)::INTEGER AS points
    FROM inserted_transactions
    GROUP BY player_id
  ), updated_players AS (
    UPDATE public.players p
    SET points_balance = p.points_balance + totals.points
    FROM player_totals totals
    WHERE p.id = totals.player_id
    RETURNING totals.points
  )
  SELECT COALESCE(SUM(points), 0)::INTEGER
  INTO v_awarded_points
  FROM updated_players;

  RETURN v_awarded_points;
END;
$$;

-- Finaliza uma sessão iniciada manualmente em uma única transação e então
-- credita os pontos calculados para seus participantes.
CREATE OR REPLACE FUNCTION public.finish_manual_jogatina(
  p_jogatina_id UUID,
  p_player_updates JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_started_at TIMESTAMP WITH TIME ZONE;
  v_session_type TEXT;
  v_duration_minutes INTEGER;
BEGIN
  SELECT COALESCE(started_at, date), session_type
  INTO v_started_at, v_session_type
  FROM public.jogatinas
  WHERE id = p_jogatina_id
    AND is_current = true
    AND source = 'manual'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Manual current jogatina % was not found', p_jogatina_id;
  END IF;

  v_duration_minutes := GREATEST(
    0,
    FLOOR(EXTRACT(EPOCH FROM (NOW() - v_started_at)) / 60)::INTEGER
  );

  WITH updates AS (
    SELECT
      (entry->>'id')::UUID AS id,
      entry->>'status' AS status,
      NULLIF(entry->>'notes', '') AS notes
    FROM JSONB_ARRAY_ELEMENTS(p_player_updates) AS update_json(entry)
  )
  UPDATE public.jogatina_players jp
  SET status = updates.status,
      notes = updates.notes,
      is_active = false,
      total_duration_minutes = v_duration_minutes,
      solo_duration_minutes = CASE WHEN v_session_type = 'solo' THEN v_duration_minutes ELSE 0 END,
      group_duration_minutes = CASE WHEN v_session_type = 'group' THEN v_duration_minutes ELSE 0 END
  FROM updates
  WHERE jp.id = updates.id
    AND jp.jogatina_id = p_jogatina_id;

  UPDATE public.jogatinas
  SET is_current = false,
      active_players = 0,
      last_event_at = NOW(),
      date = NOW(),
      total_duration_minutes = v_duration_minutes
  WHERE id = p_jogatina_id;

  PERFORM public.award_jogatina_points(p_jogatina_id);

  RETURN v_duration_minutes;
END;
$$;

REVOKE ALL ON FUNCTION public.award_jogatina_points(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finish_manual_jogatina(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_jogatina_points(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.finish_manual_jogatina(UUID, JSONB) TO authenticated, service_role;

COMMENT ON COLUMN public.players.points_balance IS 'Saldo atual de pontos ganho por minutos jogados';
COMMENT ON TABLE public.player_point_transactions IS 'Histórico idempotente de créditos de pontos por participante de jogatina';
