import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPlayerAchievements } from "@/lib/player-achievements";
import {
  buildPlayerGameLibrary,
  buildPlayerProfileSummary,
  filterGameJogatinaPlayers,
  filterGameSeasonParticipants,
  getActiveSeasonsForPlayer,
  getPlayerJogatinasForCalendar,
  getPlayerParticipationDays,
  getRecentGames,
  getTopGameCover,
  type JogatinaPlayerWithDetails,
  type SeasonParticipantWithDetails,
} from "@/lib/player-profile-helpers";

export const loadPlayerProfile = cache(async (id: string) => {
  const supabase = await createClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (playerError || !player) {
    return null;
  }

  const { data: jogatinaPlayers } = await supabase
    .from("jogatina_players")
    .select(
      `
      *,
      jogatina:jogatinas(*, game:games(*))
    `,
    )
    .eq("player_id", id);

  const { data: seasonParticipants } = await supabase
    .from("season_participants")
    .select(
      `
      *,
      season:seasons(*, game:games(*))
    `,
    )
    .eq("player_id", id);

  const gameJogatinaPlayers = filterGameJogatinaPlayers(
    (jogatinaPlayers || []) as JogatinaPlayerWithDetails[],
  );
  const gameSeasonParticipants = filterGameSeasonParticipants(
    (seasonParticipants || []) as SeasonParticipantWithDetails[],
  );

  const summary = buildPlayerProfileSummary(
    gameJogatinaPlayers,
    gameSeasonParticipants,
  );

  const library = buildPlayerGameLibrary(
    gameJogatinaPlayers,
    gameSeasonParticipants,
  );

  return {
    player,
    summary,
    achievements: getPlayerAchievements(summary) ?? [],
    library,
    recentGames: getRecentGames(library),
    participationDays: getPlayerParticipationDays(gameJogatinaPlayers),
    calendarJogatinas: getPlayerJogatinasForCalendar(gameJogatinaPlayers),
    activeSeasons: getActiveSeasonsForPlayer(gameSeasonParticipants),
    bannerCoverUrl: getTopGameCover(library),
  };
});
