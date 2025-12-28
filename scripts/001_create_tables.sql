-- Create players table
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Create games table
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text,
  created_at timestamp with time zone default now()
);

-- Create jogatinas table
create table if not exists public.jogatinas (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  date timestamp with time zone default now(),
  notes text,
  created_at timestamp with time zone default now()
);

-- Create jogatina_players table (junction table with status)
create table if not exists public.jogatina_players (
  id uuid primary key default gen_random_uuid(),
  jogatina_id uuid not null references public.jogatinas(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null check (status in ('Dropo', 'Zero', 'Dava pra jogar')),
  notes text,
  created_at timestamp with time zone default now(),
  unique(jogatina_id, player_id)
);

-- Enable Row Level Security
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.jogatinas enable row level security;
alter table public.jogatina_players enable row level security;

-- Create policies for players (allow all operations for now)
create policy "Allow public read access on players"
  on public.players for select
  using (true);

create policy "Allow public insert on players"
  on public.players for insert
  with check (true);

create policy "Allow public update on players"
  on public.players for update
  using (true);

create policy "Allow public delete on players"
  on public.players for delete
  using (true);

-- Create policies for games
create policy "Allow public read access on games"
  on public.games for select
  using (true);

create policy "Allow public insert on games"
  on public.games for insert
  with check (true);

create policy "Allow public update on games"
  on public.games for update
  using (true);

create policy "Allow public delete on games"
  on public.games for delete
  using (true);

-- Create policies for jogatinas
create policy "Allow public read access on jogatinas"
  on public.jogatinas for select
  using (true);

create policy "Allow public insert on jogatinas"
  on public.jogatinas for insert
  with check (true);

create policy "Allow public update on jogatinas"
  on public.jogatinas for update
  using (true);

create policy "Allow public delete on jogatinas"
  on public.jogatinas for delete
  using (true);

-- Create policies for jogatina_players
create policy "Allow public read access on jogatina_players"
  on public.jogatina_players for select
  using (true);

create policy "Allow public insert on jogatina_players"
  on public.jogatina_players for insert
  with check (true);

create policy "Allow public update on jogatina_players"
  on public.jogatina_players for update
  using (true);

create policy "Allow public delete on jogatina_players"
  on public.jogatina_players for delete
  using (true);

-- Create indexes for better performance
create index if not exists idx_jogatinas_game_id on public.jogatinas(game_id);
create index if not exists idx_jogatina_players_jogatina_id on public.jogatina_players(jogatina_id);
create index if not exists idx_jogatina_players_player_id on public.jogatina_players(player_id);
