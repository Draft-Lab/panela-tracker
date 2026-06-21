import { formatDuration } from "@/lib/calendar-helpers";
import {
  comparePlayerSessionRecency,
  getJogatinaLastActivityAt,
  getPlayerSessionActivityTimestamps,
  getPlayerSessionLastActivityAt,
  splitMinutesAcrossActivityDays,
} from "@/lib/jogatina-date-helpers";
import {
  getPlayerAchievements,
  type PlayerProfileSummary,
} from "@/lib/player-achievements";
import type {
  Game,
  Jogatina,
  JogatinaPlayer,
  Player,
  Season,
  SeasonParticipant,
} from "@/lib/types";

export type { PlayerProfileSummary };

export type JogatinaPlayerWithDetails = JogatinaPlayer & {
  jogatina: Jogatina & {
    game: Game;
    jogatina_players?: (JogatinaPlayer & { player: Player })[];
  };
};

export type SeasonParticipantWithDetails = SeasonParticipant & {
  season: Season & { game: Game };
};

export type JogatinaWithGame = Jogatina & { game: Game };

export interface PlayerProfileGameEntry {
  gameId: string;
  gameTitle: string;
  gameCoverUrl: string | null;
  totalMinutes: number;
  sessionCount: number;
  lastPlayedAt: string | null;
  isPlayingNow?: boolean;
}

export interface PlayerCurrentlyPlaying {
  gameId: string;
  gameTitle: string;
  gameCoverUrl: string | null;
  sessionType: "solo" | "group";
}

export interface PlayerParticipationDay {
  date: Date;
  count: number;
  totalMinutes: number;
}

export interface PlayerActiveSeasonEntry {
  season: Season;
  game: Game;
  participant: SeasonParticipant;
}

export function filterGameJogatinaPlayers(
  entries: JogatinaPlayerWithDetails[],
): JogatinaPlayerWithDetails[] {
  return entries.filter(
    (entry) => entry.jogatina?.game && !entry.jogatina.game.is_app,
  );
}

export function filterGameSeasonParticipants(
  entries: SeasonParticipantWithDetails[],
): SeasonParticipantWithDetails[] {
  return entries.filter(
    (entry) => entry.season?.game && !entry.season.game.is_app,
  );
}

export function buildPlayerProfileSummary(
  jogatinaPlayers: JogatinaPlayerWithDetails[],
  seasonParticipants: SeasonParticipantWithDetails[],
): PlayerProfileSummary {
  const gameJogatinaPlayers = filterGameJogatinaPlayers(jogatinaPlayers);
  const gameSeasonParticipants = filterGameSeasonParticipants(seasonParticipants);

  const drops =
    gameJogatinaPlayers.filter((jp) => jp.status === "Dropo").length +
    gameSeasonParticipants.filter((sp) => sp.status === "Dropo").length;

  const zeros =
    gameJogatinaPlayers.filter((jp) => jp.status === "Zero").length +
    gameSeasonParticipants.filter((sp) => sp.status === "Zero").length;

  const davaPraJogar =
    gameJogatinaPlayers.filter((jp) => jp.status === "Dava pra jogar").length +
    gameSeasonParticipants.filter((sp) => sp.status === "Dava pra jogar").length;

  const totalSessions = gameJogatinaPlayers.length;

  const totalMinutes = gameJogatinaPlayers.reduce(
    (acc, jp) => acc + (jp.total_duration_minutes || 0),
    0,
  );

  const uniqueGameIds = new Set<string>();
  gameJogatinaPlayers.forEach((jp) => uniqueGameIds.add(jp.jogatina.game_id));
  gameSeasonParticipants.forEach((sp) => uniqueGameIds.add(sp.season.game_id));

  return {
    totalMinutes,
    totalSessions,
    uniqueGames: uniqueGameIds.size,
    drops,
    zeros,
    davaPraJogar,
    dropRate: totalSessions > 0 ? (drops / totalSessions) * 100 : 0,
  };
}

export function buildPlayerGameLibrary(
  jogatinaPlayers: JogatinaPlayerWithDetails[],
  seasonParticipants: SeasonParticipantWithDetails[],
): PlayerProfileGameEntry[] {
  const library = new Map<string, PlayerProfileGameEntry>();

  filterGameJogatinaPlayers(jogatinaPlayers).forEach((jp) => {
    const game = jp.jogatina.game;
    const lastActivityAt = getPlayerSessionLastActivityAt(jp);

    if (!library.has(game.id)) {
      library.set(game.id, {
        gameId: game.id,
        gameTitle: game.title,
        gameCoverUrl: game.cover_url,
        totalMinutes: 0,
        sessionCount: 0,
        lastPlayedAt: null,
      });
    }

    const entry = library.get(game.id)!;
    entry.totalMinutes += jp.total_duration_minutes || 0;
    entry.sessionCount += 1;

    if (
      !entry.lastPlayedAt ||
      new Date(lastActivityAt) > new Date(entry.lastPlayedAt)
    ) {
      entry.lastPlayedAt = lastActivityAt;
    }
  });

  filterGameSeasonParticipants(seasonParticipants).forEach((sp) => {
    const game = sp.season.game;
    const existing = library.get(game.id);

    if (existing && existing.sessionCount > 0) {
      return;
    }

    if (!existing) {
      library.set(game.id, {
        gameId: game.id,
        gameTitle: game.title,
        gameCoverUrl: game.cover_url,
        totalMinutes: 0,
        sessionCount: 0,
        lastPlayedAt: null,
      });
    }

    const entry = library.get(game.id)!;
    entry.totalMinutes += sp.total_duration_minutes || 0;
    entry.sessionCount += sp.total_sessions || 0;

    const seasonDate = sp.status_updated_at || sp.joined_at;
    if (!entry.lastPlayedAt || new Date(seasonDate) > new Date(entry.lastPlayedAt)) {
      entry.lastPlayedAt = seasonDate;
    }
  });

  return Array.from(library.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function getRecentGames(
  library: PlayerProfileGameEntry[],
  jogatinaPlayers: JogatinaPlayerWithDetails[] = [],
  limit = 6,
): PlayerProfileGameEntry[] {
  const libraryByGameId = new Map(library.map((entry) => [entry.gameId, entry]));
  const seenGameIds = new Set<string>();
  const recentGames: PlayerProfileGameEntry[] = [];

  const sortedSessions = [...filterGameJogatinaPlayers(jogatinaPlayers)].sort(
    comparePlayerSessionRecency,
  );

  for (const jp of sortedSessions) {
    const gameId = jp.jogatina.game.id;

    if (seenGameIds.has(gameId)) {
      continue;
    }

    const entry = libraryByGameId.get(gameId);
    if (!entry) {
      continue;
    }

    seenGameIds.add(gameId);
    recentGames.push({
      ...entry,
      lastPlayedAt: getPlayerSessionLastActivityAt(jp),
      isPlayingNow: Boolean(jp.is_active && jp.jogatina.is_current),
    });

    if (recentGames.length >= limit) {
      return recentGames;
    }
  }

  if (recentGames.length > 0) {
    return recentGames;
  }

  return library
    .filter((entry) => entry.lastPlayedAt)
    .sort(
      (a, b) =>
        new Date(b.lastPlayedAt!).getTime() - new Date(a.lastPlayedAt!).getTime(),
    )
    .slice(0, limit);
}

export function getTopGameCover(
  library: PlayerProfileGameEntry[],
): string | null {
  return library[0]?.gameCoverUrl ?? null;
}

export function getPlayerCurrentlyPlaying(
  jogatinaPlayers: JogatinaPlayerWithDetails[],
): PlayerCurrentlyPlaying | null {
  const liveSession = filterGameJogatinaPlayers(jogatinaPlayers).find(
    (jp) => jp.is_active && jp.jogatina.is_current,
  );

  if (!liveSession) {
    return null;
  }

  const { game } = liveSession.jogatina;

  return {
    gameId: game.id,
    gameTitle: game.title,
    gameCoverUrl: game.cover_url,
    sessionType: liveSession.jogatina.session_type ?? "solo",
  };
}

export function getPlayerParticipationDays(
  jogatinaPlayers: JogatinaPlayerWithDetails[],
): PlayerParticipationDay[] {
  const dayMap = new Map<string, PlayerParticipationDay>();

  filterGameJogatinaPlayers(jogatinaPlayers).forEach((jp) => {
    const minutesByDay = splitMinutesAcrossActivityDays(
      getPlayerSessionActivityTimestamps(jp),
      jp.total_duration_minutes || 0,
    );

    minutesByDay.forEach((minutes, key) => {
      if (!dayMap.has(key)) {
        const [year, month, day] = key.split("-").map(Number);
        dayMap.set(key, {
          date: new Date(year, month - 1, day),
          count: 0,
          totalMinutes: 0,
        });
      }

      const day = dayMap.get(key)!;
      day.count += 1;
      day.totalMinutes += minutes;
    });
  });

  return Array.from(dayMap.values());
}

export function getPlayerJogatinasForCalendar(
  jogatinaPlayers: JogatinaPlayerWithDetails[],
): JogatinaWithGame[] {
  return filterGameJogatinaPlayers(jogatinaPlayers).map((jp) => {
    const activity = getPlayerSessionActivityTimestamps(jp);

    return {
      ...jp.jogatina,
      game: jp.jogatina.game,
      date: activity.date,
      first_event_at: activity.first_event_at ?? null,
      last_event_at: activity.last_event_at ?? null,
    };
  });
}

export function getActiveSeasonsForPlayer(
  seasonParticipants: SeasonParticipantWithDetails[],
): PlayerActiveSeasonEntry[] {
  return filterGameSeasonParticipants(seasonParticipants)
    .filter((sp) => sp.season.is_active)
    .map((sp) => ({
      season: sp.season,
      game: sp.season.game,
      participant: sp,
    }));
}

export function formatPlayerDuration(minutes: number): string {
  return formatDuration(minutes);
}

export function buildLandingPlayerCardStats(
  player: Player,
  jogatinaPlayers: JogatinaPlayer[],
  seasonParticipants: SeasonParticipant[],
) {
  const playerJogatinas = jogatinaPlayers.filter(
    (jp) => jp.player_id === player.id,
  ) as JogatinaPlayerWithDetails[];
  const playerSeasons = seasonParticipants.filter(
    (sp) => sp.player_id === player.id,
  ) as SeasonParticipantWithDetails[];

  const summary = buildPlayerProfileSummary(playerJogatinas, playerSeasons);
  return {
    player,
    totalSessions: summary.totalSessions,
    totalMinutes: summary.totalMinutes,
    dropCount: summary.drops,
    achievements: getPlayerAchievements(summary, { limit: 3 }) ?? [],
  };
}

export interface LandingPlayerCardStatsInput {
  player: Player;
  totalSessions: number;
  totalMinutes: number;
  drops: number;
  zeros: number;
  davaPraJogar: number;
  uniqueGames: number;
}

export function buildLandingPlayerCardStatsFromSummary(
  input: LandingPlayerCardStatsInput,
) {
  const summary: PlayerProfileSummary = {
    totalMinutes: input.totalMinutes,
    totalSessions: input.totalSessions,
    uniqueGames: input.uniqueGames,
    drops: input.drops,
    zeros: input.zeros,
    davaPraJogar: input.davaPraJogar,
    dropRate:
      input.totalSessions > 0 ? (input.drops / input.totalSessions) * 100 : 0,
  };

  return {
    player: input.player,
    totalSessions: input.totalSessions,
    totalMinutes: input.totalMinutes,
    dropCount: input.drops,
    uniqueGames: input.uniqueGames,
    dropRate: summary.dropRate,
    achievements: getPlayerAchievements(summary, { limit: 3 }) ?? [],
  };
}
