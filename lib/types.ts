export interface Player {
  id: string;
  name: string;
  avatar_url: string | null;
  discord_id: string | null;
  created_at: string;
  total_played_minutes?: number;
}

export interface Game {
  id: string;
  title: string;
  cover_url: string | null;
  created_at: string;
}

export interface Jogatina {
  id: string;
  game_id: string;
  date: string;
  notes: string | null;
  is_current: boolean;
  session_type: "solo" | "group";
  first_event_at: string | null;
  last_event_at: string | null;
  total_duration_minutes: number | null;
  active_players: number;
  source: "manual" | "discord_bot";
  season_id: string | null;
  created_at: string;
}

export interface JogatinaEvent {
  id: string;
  jogatina_id: string;
  player_id: string;
  event_type: "player_joined" | "player_left";
  timestamp: string;
  created_at: string;
}

export interface JogatinaPlayer {
  id: string;
  jogatina_id: string;
  player_id: string;
  status: "Jogatina" | "Dropo" | "Zero" | "Dava pra jogar";
  notes: string | null;
  is_active: boolean;
  solo_duration_minutes: number;
  group_duration_minutes: number;
  total_duration_minutes: number;
  created_at: string;
}

export interface Season {
  id: string;
  game_id: string;
  name: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SeasonParticipant {
  id: string;
  season_id: string;
  player_id: string;
  status: "Dropo" | "Zero" | "Dava pra jogar" | "Em andamento" | null;
  total_sessions: number;
  total_duration_minutes: number;
  solo_duration_minutes: number;
  group_duration_minutes: number;
  notes: string | null;
  joined_at: string;
  status_updated_at: string | null;
  created_at: string;
}

export interface JogatinaWithDetails extends Jogatina {
  game: Game;
  jogatina_players: (JogatinaPlayer & { player: Player })[];
  jogatina_events?: (JogatinaEvent & { player: Player })[];
}

export interface SeasonWithDetails extends Season {
  game: Game;
  season_participants: (SeasonParticipant & { player: Player })[];
  jogatinas?: JogatinaWithDetails[];
}

export interface PlayerSessionStats {
  player_id: string;
  player_name: string;
  total_time_minutes: number;
  solo_time_minutes: number;
  group_time_minutes: number;
  join_count: number;
  leave_count: number;
  first_join: string | null;
  last_leave: string | null;
}

export interface EventCalculationResult {
  player_id: string;
  total_time_minutes: number;
  solo_time_minutes: number;
  group_time_minutes: number;
  status: "Jogatina" | "Dropo" | "Zero" | "Dava pra jogar";
}
