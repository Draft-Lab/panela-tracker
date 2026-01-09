-- Drop the old check constraint and add a new one with 'Jogatina' status
ALTER TABLE public.jogatina_players
DROP CONSTRAINT jogatina_players_status_check;

-- Add the new constraint with all valid statuses including 'Jogatina'
ALTER TABLE public.jogatina_players
ADD CONSTRAINT jogatina_players_status_check 
CHECK (status in ('Jogatina', 'Dropo', 'Zero', 'Dava pra jogar'));
