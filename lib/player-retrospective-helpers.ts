import { formatDuration } from "@/lib/calendar-helpers";
import { getPlayerAchievements, type PlayerAchievement } from "@/lib/player-achievements";
import {
  buildPlayerProfileSummary,
  filterGameJogatinaPlayers,
  filterGameSeasonParticipants,
  type JogatinaPlayerWithDetails,
  type SeasonParticipantWithDetails,
} from "@/lib/player-profile-helpers";
import {
  getMonthName,
  MONTH_NAMES_PT,
  parseYearParam,
} from "@/lib/retrospective-helpers";
import type { Game, Player } from "@/lib/types";

export interface PlayerRankedGame {
  rank: number;
  game: Game;
  minutes: number;
  percent: number;
}

export interface PlayerRankedSquadMate {
  rank: number;
  player: Player;
  sharedSessions: number;
  percent: number;
}

export interface PlayerMonthlyCover {
  monthIndex: number;
  monthName: string;
  game: Game;
  totalMinutes: number;
  sessionCount: number;
}

export interface PlayerYearRetrospective {
  year: number;
  player: Player;
  isEmpty: boolean;
  totalMinutes: number;
  totalHoursLabel: string;
  totalSessions: number;
  uniqueGames: number;
  topGame: Game | null;
  topGameMinutes: number;
  topGamePercent: number;
  rankedGames: PlayerRankedGame[];
  rankedSquadMates: PlayerRankedSquadMate[];
  totalGroupSessions: number;
  busiestMonth: {
    monthIndex: number;
    monthName: string;
    sessionCount: number;
  } | null;
  drops: number;
  zeros: number;
  davaPraJogar: number;
  achievements: PlayerAchievement[];
  monthlyCovers: PlayerMonthlyCover[];
}

function isDateInYear(dateStr: string, year: number): boolean {
  const date = new Date(dateStr);
  return date.getFullYear() === year;
}

export function filterPlayerJogatinasByYear(
  entries: JogatinaPlayerWithDetails[],
  year: number,
): JogatinaPlayerWithDetails[] {
  return filterGameJogatinaPlayers(entries).filter((entry) =>
    isDateInYear(entry.jogatina.date, year),
  );
}

export function filterPlayerSeasonParticipantsByYear(
  entries: SeasonParticipantWithDetails[],
  year: number,
): SeasonParticipantWithDetails[] {
  return filterGameSeasonParticipants(entries).filter((entry) => {
    const activityDate =
      entry.status_updated_at || entry.joined_at || entry.created_at;
    return isDateInYear(activityDate, year);
  });
}

export function getPlayerAvailableYears(
  jogatinaPlayers: JogatinaPlayerWithDetails[],
  seasonParticipants: SeasonParticipantWithDetails[],
): number[] {
  const currentYear = new Date().getFullYear();
  const years = new Set<number>([currentYear]);

  filterGameJogatinaPlayers(jogatinaPlayers).forEach((entry) => {
    years.add(new Date(entry.jogatina.date).getFullYear());
  });

  filterGameSeasonParticipants(seasonParticipants).forEach((entry) => {
    const activityDate =
      entry.status_updated_at || entry.joined_at || entry.created_at;
    years.add(new Date(activityDate).getFullYear());
  });

  return Array.from(years).sort((a, b) => b - a);
}

function buildMonthlyCovers(
  yearJogatinaPlayers: JogatinaPlayerWithDetails[],
): PlayerMonthlyCover[] {
  const covers: PlayerMonthlyCover[] = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const monthEntries = yearJogatinaPlayers.filter(
      (entry) => new Date(entry.jogatina.date).getMonth() === monthIndex,
    );

    if (monthEntries.length === 0) continue;

    const gameStats = new Map<
      string,
      { game: Game; minutes: number; sessions: number }
    >();

    monthEntries.forEach((entry) => {
      const game = entry.jogatina.game;
      const existing = gameStats.get(game.id);
      const minutes = entry.total_duration_minutes || 0;

      if (existing) {
        existing.minutes += minutes;
        existing.sessions += 1;
      } else {
        gameStats.set(game.id, { game, minutes, sessions: 1 });
      }
    });

    let top: { game: Game; minutes: number; sessions: number } | null = null;
    gameStats.forEach((stats) => {
      if (!top || stats.minutes > top.minutes) {
        top = stats;
      }
    });

    if (!top) continue;

    covers.push({
      monthIndex,
      monthName: MONTH_NAMES_PT[monthIndex] ?? getMonthName(monthIndex),
      game: top.game,
      totalMinutes: top.minutes,
      sessionCount: top.sessions,
    });
  }

  return covers;
}

function pickRankedGamesByMinutes(
  yearJogatinaPlayers: JogatinaPlayerWithDetails[],
  totalMinutes: number,
  limit = 3,
): PlayerRankedGame[] {
  const gameStats = new Map<string, { game: Game; minutes: number }>();

  yearJogatinaPlayers.forEach((entry) => {
    const game = entry.jogatina.game;
    const minutes = entry.total_duration_minutes || 0;
    const existing = gameStats.get(game.id);

    if (existing) {
      existing.minutes += minutes;
    } else {
      gameStats.set(game.id, { game, minutes });
    }
  });

  return Array.from(gameStats.values())
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit)
    .map((stats, index) => ({
      rank: index + 1,
      game: stats.game,
      minutes: stats.minutes,
      percent:
        totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0,
    }));
}

function pickRankedSquadMates(
  playerId: string,
  yearJogatinaPlayers: JogatinaPlayerWithDetails[],
  limit = 3,
): { rankedSquadMates: PlayerRankedSquadMate[]; totalGroupSessions: number } {
  const coPlayerStats = new Map<
    string,
    { player: Player; sharedSessions: number }
  >();
  let totalGroupSessions = 0;

  yearJogatinaPlayers.forEach((entry) => {
    const coPlayers =
      entry.jogatina.jogatina_players?.filter(
        (jp) => jp.player_id !== playerId && jp.player,
      ) ?? [];

    if (coPlayers.length === 0) return;

    totalGroupSessions += 1;

    const uniqueCoPlayerIds = new Set(coPlayers.map((jp) => jp.player_id));
    uniqueCoPlayerIds.forEach((coPlayerId) => {
      const coPlayer = coPlayers.find((jp) => jp.player_id === coPlayerId)?.player;
      if (!coPlayer) return;

      const existing = coPlayerStats.get(coPlayerId);
      if (existing) {
        existing.sharedSessions += 1;
      } else {
        coPlayerStats.set(coPlayerId, {
          player: coPlayer,
          sharedSessions: 1,
        });
      }
    });
  });

  if (totalGroupSessions === 0) {
    return { rankedSquadMates: [], totalGroupSessions: 0 };
  }

  const rankedSquadMates = Array.from(coPlayerStats.values())
    .sort((a, b) => b.sharedSessions - a.sharedSessions)
    .slice(0, limit)
    .map((stats, index) => ({
      rank: index + 1,
      player: stats.player,
      sharedSessions: stats.sharedSessions,
      percent: Math.round(
        (stats.sharedSessions / totalGroupSessions) * 100,
      ),
    }));

  return { rankedSquadMates, totalGroupSessions };
}

function pickBusiestMonth(
  yearJogatinaPlayers: JogatinaPlayerWithDetails[],
): PlayerYearRetrospective["busiestMonth"] {
  const monthlyCounts = new Map<number, number>();

  yearJogatinaPlayers.forEach((entry) => {
    const monthIndex = new Date(entry.jogatina.date).getMonth();
    monthlyCounts.set(monthIndex, (monthlyCounts.get(monthIndex) || 0) + 1);
  });

  let busiest: PlayerYearRetrospective["busiestMonth"] = null;
  monthlyCounts.forEach((sessionCount, monthIndex) => {
    if (!busiest || sessionCount > busiest.sessionCount) {
      busiest = {
        monthIndex,
        monthName: getMonthName(monthIndex),
        sessionCount,
      };
    }
  });

  return busiest;
}

export function buildPlayerYearRetrospective(
  player: Player,
  jogatinaPlayers: JogatinaPlayerWithDetails[],
  seasonParticipants: SeasonParticipantWithDetails[],
  year: number,
): PlayerYearRetrospective {
  const yearJogatinaPlayers = filterPlayerJogatinasByYear(
    jogatinaPlayers,
    year,
  );
  const yearSeasonParticipants = filterPlayerSeasonParticipantsByYear(
    seasonParticipants,
    year,
  );

  const summary = buildPlayerProfileSummary(
    yearJogatinaPlayers,
    yearSeasonParticipants,
  );

  const rankedGames = pickRankedGamesByMinutes(
    yearJogatinaPlayers,
    summary.totalMinutes,
  );
  const { rankedSquadMates, totalGroupSessions } = pickRankedSquadMates(
    player.id,
    yearJogatinaPlayers,
  );
  const topGameResult = rankedGames[0] ?? null;
  const topGame = topGameResult?.game ?? null;
  const topGameMinutes = topGameResult?.minutes ?? 0;
  const topGamePercent = topGameResult?.percent ?? 0;

  const achievements = getPlayerAchievements(summary);
  const monthlyCovers = buildMonthlyCovers(yearJogatinaPlayers);

  return {
    year,
    player,
    isEmpty: summary.totalSessions === 0,
    totalMinutes: summary.totalMinutes,
    totalHoursLabel: formatDuration(summary.totalMinutes),
    totalSessions: summary.totalSessions,
    uniqueGames: summary.uniqueGames,
    topGame,
    topGameMinutes,
    topGamePercent,
    rankedGames,
    rankedSquadMates,
    totalGroupSessions,
    busiestMonth: pickBusiestMonth(yearJogatinaPlayers),
    drops: summary.drops,
    zeros: summary.zeros,
    davaPraJogar: summary.davaPraJogar,
    achievements,
    monthlyCovers,
  };
}

export function parsePlayerRetrospectiveYear(
  yearParam: string | string[] | undefined,
  availableYears: number[],
): number {
  return parseYearParam(yearParam, availableYears);
}
