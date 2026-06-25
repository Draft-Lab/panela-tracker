import {
  formatDuration,
  getUniqueGamesForDay,
  type CalendarGameEntry,
} from "@/lib/calendar-helpers";
import {
  getUniquePlayerCount,
  type JogatinaWithPlayers,
} from "@/lib/game-stats-helpers";
import type { Game, Jogatina, JogatinaPlayer, Player } from "@/lib/types";

const MIN_PLAYERS_FOR_GROUP_SESSION = 2;

export const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const MONTH_SLUGS = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export type RetrospectiveJogatina = Jogatina & {
  game: Game;
  jogatina_players?: (JogatinaPlayer & { player: Player })[];
};

export interface MonthlyRetrospectiveEntry {
  monthIndex: number;
  monthName: string;
  monthSlug: string;
  sessionCount: number;
  totalMinutes: number;
  uniqueGames: Game[];
  uniqueGameEntries: CalendarGameEntry[];
  jogatinas: RetrospectiveJogatina[];
}

export interface YearSummary {
  year: number;
  totalSessions: number;
  totalMinutes: number;
  totalHoursLabel: string;
  uniqueGames: number;
  uniquePlayers: number;
  busiestMonth: {
    monthIndex: number;
    monthName: string;
    sessionCount: number;
  } | null;
  topGame: Game | null;
  topGameSessions: number;
  spotlightSessions: Game | null;
  spotlightPlaytime: Game | null;
  spotlightVariety: Game | null;
  spotlightBusiestMonth: Game | null;
}

function pickTopGameBySessions(
  gameStats: Map<string, { game: Game; sessions: number }>,
): Game | null {
  let top: Game | null = null;
  let maxSessions = 0;
  gameStats.forEach(({ game, sessions }) => {
    if (sessions > maxSessions) {
      maxSessions = sessions;
      top = game;
    }
  });
  return top;
}

function pickSecondGameBySessions(
  gameStats: Map<string, { game: Game; sessions: number }>,
): Game | null {
  const ranked = Array.from(gameStats.values()).sort(
    (a, b) => b.sessions - a.sessions,
  );
  return ranked[1]?.game ?? null;
}

function pickTopGameByPlaytime(
  groupJogatinas: RetrospectiveJogatina[],
): Game | null {
  const minutesByGame = new Map<string, { game: Game; minutes: number }>();

  groupJogatinas.forEach((jogatina) => {
    const existing = minutesByGame.get(jogatina.game.id);
    const minutes = jogatina.total_duration_minutes || 0;
    if (existing) {
      existing.minutes += minutes;
    } else {
      minutesByGame.set(jogatina.game.id, { game: jogatina.game, minutes });
    }
  });

  let top: Game | null = null;
  let maxMinutes = 0;
  minutesByGame.forEach(({ game, minutes }) => {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      top = game;
    }
  });

  return top;
}

function pickTopGameInMonth(
  groupJogatinas: RetrospectiveJogatina[],
  monthIndex: number,
): Game | null {
  const monthJogatinas = groupJogatinas.filter(
    (j) => new Date(j.date).getMonth() === monthIndex,
  );
  const gameStats = new Map<string, { game: Game; sessions: number }>();

  monthJogatinas.forEach((jogatina) => {
    const existing = gameStats.get(jogatina.game.id);
    if (existing) {
      existing.sessions++;
    } else {
      gameStats.set(jogatina.game.id, { game: jogatina.game, sessions: 1 });
    }
  });

  return pickTopGameBySessions(gameStats);
}

export function getMonthSlug(monthIndex: number): string {
  return MONTH_SLUGS[monthIndex] ?? `mes-${monthIndex}`;
}

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES_PT[monthIndex] ?? `Mês ${monthIndex + 1}`;
}

export function getFirstActiveMonthIndex(
  months: MonthlyRetrospectiveEntry[],
): number {
  return (
    months.find((month) => month.uniqueGameEntries.length > 0)?.monthIndex ?? 0
  );
}

export function getAvailableYears(jogatinas: Jogatina[]): number[] {
  const currentYear = new Date().getFullYear();
  const years = new Set<number>([currentYear]);

  jogatinas.forEach((jogatina) => {
    years.add(new Date(jogatina.date).getFullYear());
  });

  return Array.from(years).sort((a, b) => b - a);
}

export function filterJogatinasByYear<T extends Jogatina>(
  jogatinas: T[],
  year: number,
): T[] {
  const start = new Date(year, 0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, 11, 31);
  end.setHours(23, 59, 59, 999);

  return jogatinas.filter((jogatina) => {
    const date = new Date(jogatina.date);
    return date >= start && date <= end;
  });
}

export function isGroupSession(
  jogatina: JogatinaWithPlayers,
  jogatinaPlayers: JogatinaPlayer[],
): boolean {
  return (
    getUniquePlayerCount(jogatina, jogatinaPlayers) >=
    MIN_PLAYERS_FOR_GROUP_SESSION
  );
}

export function filterGroupJogatinas<T extends JogatinaWithPlayers>(
  jogatinas: T[],
  jogatinaPlayers: JogatinaPlayer[],
): T[] {
  return jogatinas.filter((jogatina) =>
    isGroupSession(jogatina, jogatinaPlayers),
  );
}

export function parseYearParam(
  yearParam: string | string[] | undefined,
  availableYears: number[],
): number {
  const currentYear = new Date().getFullYear();
  const raw = Array.isArray(yearParam) ? yearParam[0] : yearParam;
  const parsed = raw ? Number.parseInt(raw, 10) : currentYear;

  if (!Number.isFinite(parsed) || parsed > currentYear) {
    return currentYear;
  }

  if (availableYears.includes(parsed)) {
    return parsed;
  }

  return currentYear;
}

export function buildYearSummary(
  jogatinas: RetrospectiveJogatina[],
  jogatinaPlayers: JogatinaPlayer[],
  year: number,
): YearSummary {
  const yearJogatinas = filterJogatinasByYear(jogatinas, year);
  const groupJogatinas = filterGroupJogatinas(yearJogatinas, jogatinaPlayers);

  const uniqueGameIds = new Set(groupJogatinas.map((j) => j.game.id));
  const uniquePlayerIds = new Set<string>();

  groupJogatinas.forEach((jogatina) => {
    const players =
      jogatina.jogatina_players?.length
        ? jogatina.jogatina_players
        : jogatinaPlayers.filter((jp) => jp.jogatina_id === jogatina.id);

    players.forEach((jp) => uniquePlayerIds.add(jp.player_id));
  });

  const totalMinutes = groupJogatinas.reduce(
    (sum, j) => sum + (j.total_duration_minutes || 0),
    0,
  );

  const gameSessionCounts = new Map<string, { game: Game; sessions: number }>();
  groupJogatinas.forEach((jogatina) => {
    const existing = gameSessionCounts.get(jogatina.game.id);
    if (existing) {
      existing.sessions++;
    } else {
      gameSessionCounts.set(jogatina.game.id, {
        game: jogatina.game,
        sessions: 1,
      });
    }
  });

  const topGame = pickTopGameBySessions(gameSessionCounts);
  const topGameSessions = topGame
    ? gameSessionCounts.get(topGame.id)?.sessions ?? 0
    : 0;
  const spotlightPlaytime = pickTopGameByPlaytime(groupJogatinas);
  const spotlightVariety = pickSecondGameBySessions(gameSessionCounts);

  const monthlyCounts = new Map<number, number>();
  groupJogatinas.forEach((jogatina) => {
    const monthIndex = new Date(jogatina.date).getMonth();
    monthlyCounts.set(monthIndex, (monthlyCounts.get(monthIndex) || 0) + 1);
  });

  let busiestMonth: YearSummary["busiestMonth"] = null;
  for (const [monthIndex, sessionCount] of monthlyCounts.entries()) {
    if (!busiestMonth || sessionCount > busiestMonth.sessionCount) {
      busiestMonth = {
        monthIndex,
        monthName: getMonthName(monthIndex),
        sessionCount,
      };
    }
  }

  const spotlightBusiestMonth = busiestMonth
    ? pickTopGameInMonth(groupJogatinas, busiestMonth.monthIndex)
    : null;

  return {
    year,
    totalSessions: groupJogatinas.length,
    totalMinutes,
    totalHoursLabel: formatDuration(totalMinutes),
    uniqueGames: uniqueGameIds.size,
    uniquePlayers: uniquePlayerIds.size,
    busiestMonth,
    topGame,
    topGameSessions,
    spotlightSessions: topGame,
    spotlightPlaytime,
    spotlightVariety: spotlightVariety ?? topGame,
    spotlightBusiestMonth: spotlightBusiestMonth ?? topGame,
  };
}

export function buildMonthlyRetrospective(
  jogatinas: RetrospectiveJogatina[],
  jogatinaPlayers: JogatinaPlayer[],
  year: number,
): MonthlyRetrospectiveEntry[] {
  const yearJogatinas = filterJogatinasByYear(jogatinas, year);
  const groupJogatinas = filterGroupJogatinas(yearJogatinas, jogatinaPlayers);

  return MONTH_NAMES_PT.map((monthName, monthIndex) => {
    const monthJogatinas = yearJogatinas
      .filter((j) => new Date(j.date).getMonth() === monthIndex)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

    const groupMonthJogatinas = groupJogatinas.filter(
      (j) => new Date(j.date).getMonth() === monthIndex,
    );

    const totalMinutes = groupMonthJogatinas.reduce(
      (sum, j) => sum + (j.total_duration_minutes || 0),
      0,
    );

    const uniqueGameEntries = getUniqueGamesForDay(monthJogatinas);
    const uniqueGames = uniqueGameEntries.map((entry) => entry.game);

    return {
      monthIndex,
      monthName,
      monthSlug: getMonthSlug(monthIndex),
      sessionCount: groupMonthJogatinas.length,
      totalMinutes,
      uniqueGames,
      uniqueGameEntries,
      jogatinas: monthJogatinas,
    };
  });
}
