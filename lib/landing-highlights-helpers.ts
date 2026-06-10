import { getUniquePlayerCount, type JogatinaWithPlayers } from "@/lib/game-stats-helpers";
import type {
  Game,
  Jogatina,
  JogatinaPlayer,
  Player,
  Season,
  SeasonParticipant,
} from "@/lib/types";

export const MIN_COMEBACK_GAP_DAYS = 30;
export const MIN_GROUP_PLAYERS = 2;

export type ComebackHighlight = {
  type: "comeback";
  game: Game;
  gapDays: number;
  returnDate: string;
};

export type BiggestGroupHighlight = {
  type: "biggest-group";
  jogatina: Jogatina;
  game: Game;
  playerCount: number;
  date: string;
};

export type ChampionHighlight = {
  type: "champion";
  game: Game;
  totalZeros: number;
  latestZeroDate: string;
  playerName?: string;
};

export type HighlightMoment =
  | ComebackHighlight
  | BiggestGroupHighlight
  | ChampionHighlight;

type JogatinaPlayerWithJogatina = JogatinaPlayer & {
  jogatina?: Jogatina & { game: Game };
  player?: Player;
};

type SeasonParticipantWithSeason = SeasonParticipant & {
  season?: Season & { game: Game };
  player?: Player;
};

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatGapDays(days: number): string {
  if (days < 30) {
    return days === 1 ? "1 dia depois" : `${days} dias depois`;
  }

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  if (years === 0) {
    return months === 1 ? "1 mês depois" : `${months} meses depois`;
  }

  if (months === 0) {
    return years === 1 ? "1 ano depois" : `${years} anos depois`;
  }

  const yearLabel = years === 1 ? "1 ano" : `${years} anos`;
  const monthLabel = months === 1 ? "1 mês" : `${months} meses`;
  return `${yearLabel} e ${monthLabel} depois`;
}

export function findLongestComeback(
  jogatinas: JogatinaWithPlayers[],
  minGapDays = MIN_COMEBACK_GAP_DAYS,
): ComebackHighlight | null {
  const sessionsByGame = new Map<string, JogatinaWithPlayers[]>();

  jogatinas.forEach((jogatina) => {
    const existing = sessionsByGame.get(jogatina.game_id) ?? [];
    existing.push(jogatina);
    sessionsByGame.set(jogatina.game_id, existing);
  });

  let best: ComebackHighlight | null = null;

  sessionsByGame.forEach((sessions) => {
    if (sessions.length < 2) {
      return;
    }

    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    for (let index = 1; index < sorted.length; index += 1) {
      const gapDays = daysBetween(sorted[index - 1].date, sorted[index].date);
      if (gapDays < minGapDays) {
        continue;
      }

      if (!best || gapDays > best.gapDays) {
        best = {
          type: "comeback",
          game: sorted[index].game,
          gapDays,
          returnDate: sorted[index].date,
        };
      }
    }
  });

  return best;
}

export function findBiggestGroupSession(
  jogatinas: JogatinaWithPlayers[],
  jogatinaPlayers: JogatinaPlayer[],
  minPlayers = MIN_GROUP_PLAYERS,
): BiggestGroupHighlight | null {
  let best: BiggestGroupHighlight | null = null;

  jogatinas.forEach((jogatina) => {
    const playerCount = getUniquePlayerCount(jogatina, jogatinaPlayers);
    if (playerCount < minPlayers) {
      return;
    }

    if (
      !best ||
      playerCount > best.playerCount ||
      (playerCount === best.playerCount &&
        new Date(jogatina.date).getTime() > new Date(best.date).getTime())
    ) {
      best = {
        type: "biggest-group",
        jogatina,
        game: jogatina.game,
        playerCount,
        date: jogatina.date,
      };
    }
  });

  return best;
}

function getZeroTimestamp(entry: {
  status_updated_at?: string | null;
  created_at: string;
}): number {
  return new Date(entry.status_updated_at ?? entry.created_at).getTime();
}

export function findLatestChampionZero(
  jogatinaPlayers: JogatinaPlayerWithJogatina[],
  seasonParticipants: SeasonParticipantWithSeason[],
): ChampionHighlight | null {
  const zeroEntries: Array<{
    game: Game;
    timestamp: number;
    playerName?: string;
  }> = [];

  jogatinaPlayers.forEach((entry) => {
    if (entry.status !== "Zero" || !entry.jogatina?.game) {
      return;
    }

    zeroEntries.push({
      game: entry.jogatina.game,
      timestamp: getZeroTimestamp(entry),
      playerName: entry.player?.name,
    });
  });

  seasonParticipants.forEach((entry) => {
    if (entry.status !== "Zero" || !entry.season?.game) {
      return;
    }

    zeroEntries.push({
      game: entry.season.game,
      timestamp: getZeroTimestamp(entry),
      playerName: entry.player?.name,
    });
  });

  if (zeroEntries.length === 0) {
    return null;
  }

  const latest = zeroEntries.reduce((prev, current) =>
    current.timestamp > prev.timestamp ? current : prev,
  );

  return {
    type: "champion",
    game: latest.game,
    totalZeros: zeroEntries.length,
    latestZeroDate: new Date(latest.timestamp).toISOString(),
    playerName: latest.playerName,
  };
}

export function formatHighlightDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
