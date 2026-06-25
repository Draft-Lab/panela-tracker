-- Aggregate finished jogatina playtime in one query (used by landing hero RPC)
create or replace function public.get_finished_playtime_totals()
returns table (
  game_minutes bigint,
  app_minutes bigint,
  session_count bigint
)
language sql
stable
security invoker
as $$
  select
    coalesce(sum(j.total_duration_minutes) filter (where not g.is_app), 0),
    coalesce(sum(j.total_duration_minutes) filter (where g.is_app), 0),
    count(*)::bigint
  from public.jogatinas j
  inner join public.games g on g.id = j.game_id
  where j.is_current = false;
$$;

grant execute on function public.get_finished_playtime_totals() to anon, authenticated;
