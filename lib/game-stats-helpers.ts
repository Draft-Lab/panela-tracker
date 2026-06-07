import type { Jogatina, Game, JogatinaPlayer } from "@/lib/types";

export interface GameRankingStat {
  game: Game;
  sessions: number;
  participations: number;
}

export function calculateTopGames(
  jogatinas: (Jogatina & { game: Game })[],
  jogatinaPlayers: JogatinaPlayer[],
  limit = 5,
): GameRankingStat[] {
  const gameStats = jogatinas.reduce(
    (acc, jogatina) => {
      const gameId = jogatina.game.id;
      if (!acc[gameId]) {
        acc[gameId] = {
          game: jogatina.game,
          sessions: 0,
          participations: 0,
        };
      }
      acc[gameId].sessions++;
      acc[gameId].participations += jogatinaPlayers.filter(
        (jp) => jp.jogatina_id === jogatina.id,
      ).length;
      return acc;
    },
    {} as Record<string, GameRankingStat>,
  );

  return Object.values(gameStats)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, limit);
}
