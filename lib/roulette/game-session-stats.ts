import type { Jogatina, JogatinaPlayer } from "@/lib/types";
import type { GameSessionStats } from "./types";

const MIN_PLAYERS_FOR_GROUP_SESSION = 2;

type JogatinaWithPlayers = Jogatina & {
  jogatina_players?: Pick<JogatinaPlayer, "player_id">[];
};

export type { JogatinaWithPlayers };

function getUniquePlayerCount(
  jogatina: JogatinaWithPlayers,
  jogatinaPlayers: Pick<JogatinaPlayer, "jogatina_id" | "player_id">[],
): number {
  const nested = jogatina.jogatina_players ?? [];
  const players =
    nested.length > 0
      ? nested
      : jogatinaPlayers.filter((jp) => jp.jogatina_id === jogatina.id);

  return new Set(players.map((jp) => jp.player_id)).size;
}

export function buildGameSessionStatsMap(
  jogatinas: JogatinaWithPlayers[],
  jogatinaPlayers: Pick<JogatinaPlayer, "jogatina_id" | "player_id">[],
): Map<string, GameSessionStats> {
  const statsMap = new Map<string, GameSessionStats>();

  for (const jogatina of jogatinas) {
    const playerCount = getUniquePlayerCount(jogatina, jogatinaPlayers);
    if (playerCount < MIN_PLAYERS_FOR_GROUP_SESSION) continue;

    const existing = statsMap.get(jogatina.game_id) ?? {
      groupSessions: 0,
      lastGroupPlayedAt: null,
    };

    existing.groupSessions += 1;

    const playedAt = jogatina.date;
    if (
      !existing.lastGroupPlayedAt ||
      new Date(playedAt) > new Date(existing.lastGroupPlayedAt)
    ) {
      existing.lastGroupPlayedAt = playedAt;
    }

    statsMap.set(jogatina.game_id, existing);
  }

  return statsMap;
}

export function getGameSessionStats(
  statsMap: Map<string, GameSessionStats>,
  gameId: string,
): GameSessionStats {
  return (
    statsMap.get(gameId) ?? {
      groupSessions: 0,
      lastGroupPlayedAt: null,
    }
  );
}
