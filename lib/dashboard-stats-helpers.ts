import type { Game, Jogatina, JogatinaPlayer } from "@/lib/types";

export interface DashboardGameStat {
  gameId: string;
  game: Game | null;
  gameTitle: string;
  coverUrl: string | null;
  totalJogatinas: number;
  totalParticipations: number;
  dropos: number;
  zeros: number;
  davaPraJogar: number;
}

export function buildDashboardGameStats(
  jogatinas: (Jogatina & { game?: Game })[],
  jogatinaPlayers: (JogatinaPlayer & {
    jogatina: { game_id: string; game?: Game };
  })[],
): DashboardGameStat[] {
  const gameMap = new Map<string, DashboardGameStat>();

  jogatinas.forEach((jogatina) => {
    if (!gameMap.has(jogatina.game_id)) {
      gameMap.set(jogatina.game_id, {
        gameId: jogatina.game_id,
        game: jogatina.game ?? null,
        gameTitle: jogatina.game?.title || "Jogo desconhecido",
        coverUrl: jogatina.game?.cover_url ?? null,
        totalJogatinas: 0,
        totalParticipations: 0,
        dropos: 0,
        zeros: 0,
        davaPraJogar: 0,
      });
    }
    gameMap.get(jogatina.game_id)!.totalJogatinas++;
  });

  jogatinaPlayers.forEach((jp) => {
    const gameId = jp.jogatina.game_id;
    const game = jp.jogatina.game;

    if (!gameMap.has(gameId)) {
      gameMap.set(gameId, {
        gameId,
        game: game ?? null,
        gameTitle: game?.title || "Jogo desconhecido",
        coverUrl: game?.cover_url ?? null,
        totalJogatinas: 0,
        totalParticipations: 0,
        dropos: 0,
        zeros: 0,
        davaPraJogar: 0,
      });
    }

    const stat = gameMap.get(gameId)!;
    if (game?.title) stat.gameTitle = game.title;
    if (game?.cover_url) stat.coverUrl = game.cover_url;
    if (game) stat.game = game;

    stat.totalParticipations++;
    if (jp.status === "Dropo") stat.dropos++;
    else if (jp.status === "Zero") stat.zeros++;
    else if (jp.status === "Dava pra jogar") stat.davaPraJogar++;
  });

  return Array.from(gameMap.values()).sort(
    (a, b) => b.totalJogatinas - a.totalJogatinas,
  );
}
