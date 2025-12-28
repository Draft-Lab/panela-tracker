export interface Player {
  id: string;
  name: string;
  avatar_url: string | null;
  discord_id: string | null;
  created_at: string;
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
  duration_minutes: number | null;
  started_at: string | null;
  ended_at: string | null;
  source: "manual" | "discord_bot";
  created_at: string;
}

export interface JogatinaPlayer {
  id: string;
  jogatina_id: string;
  player_id: string;
  status: "Dropo" | "Zero" | "Dava pra jogar";
  notes: string | null;
  created_at: string;
}

export interface JogatinaWithDetails extends Jogatina {
  game: Game;
  jogatina_players: (JogatinaPlayer & { player: Player })[];
}
