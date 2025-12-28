-- Add is_current column to jogatinas table to track active gaming sessions
alter table public.jogatinas add column if not exists is_current boolean default false;

-- Create index for better performance when querying current games
create index if not exists idx_jogatinas_is_current on public.jogatinas(is_current) where is_current = true;
