-- Add IGDB metadata fields to games table
alter table public.games
  add column if not exists igdb_id integer,
  add column if not exists summary text,
  add column if not exists storyline text,
  add column if not exists first_release_date timestamptz,
  add column if not exists genres text[],
  add column if not exists platforms text[],
  add column if not exists developers text[],
  add column if not exists themes text[],
  add column if not exists game_modes text[],
  add column if not exists rating numeric,
  add column if not exists igdb_url text,
  add column if not exists screenshots text[],
  add column if not exists igdb_synced_at timestamptz;
