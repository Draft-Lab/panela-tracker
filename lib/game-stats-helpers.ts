import type { Jogatina, Game, JogatinaPlayer } from "@/lib/types";

export type JogatinaPlayerRef = Pick<JogatinaPlayer, "jogatina_id" | "player_id">;

const MIN_PLAYERS_FOR_GROUP_SESSION = 2;

export interface GameRankingStat {
  game: Game;
  sessions: number;
  participations: number;
}

export type JogatinaWithPlayers = Jogatina & {
  game: Game;
  jogatina_players?: JogatinaPlayer[];
};

export function getPlayersForJogatina(
  jogatina: JogatinaWithPlayers,
  jogatinaPlayers: JogatinaPlayerRef[],
): JogatinaPlayerRef[] {
  const nested = jogatina.jogatina_players ?? [];
  if (nested.length > 0) {
    return nested;
  }

  return jogatinaPlayers.filter((jp) => jp.jogatina_id === jogatina.id);
}

export function getUniquePlayerCount(
  jogatina: JogatinaWithPlayers,
  jogatinaPlayers: JogatinaPlayerRef[],
): number {
  const players = getPlayersForJogatina(jogatina, jogatinaPlayers);
  return new Set(players.map((jp) => jp.player_id)).size;
}

export function calculateTopGames(
  jogatinas: JogatinaWithPlayers[],
  jogatinaPlayers: JogatinaPlayerRef[],
  limit = 5,
): GameRankingStat[] {
  const gameStats = jogatinas.reduce(
    (acc, jogatina) => {
      const playerCount = getUniquePlayerCount(jogatina, jogatinaPlayers);
      if (playerCount < MIN_PLAYERS_FOR_GROUP_SESSION) {
        return acc;
      }

      const gameId = jogatina.game.id;
      if (!acc[gameId]) {
        acc[gameId] = {
          game: jogatina.game,
          sessions: 0,
          participations: 0,
        };
      }
      acc[gameId].sessions++;
      acc[gameId].participations += playerCount;
      return acc;
    },
    {} as Record<string, GameRankingStat>,
  );

  return Object.values(gameStats)
    .filter((stat) => stat.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, limit);
}
