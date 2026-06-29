import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchPlayerJogatinaPlayers } from "@/lib/fetch-player-sessions";
import { getPlayerAchievements } from "@/lib/player-achievements";
import {
  buildPlayerGameLibrary,
  buildPlayerProfileSummary,
  filterGameJogatinaPlayers,
  filterGameSeasonParticipants,
  getActiveSeasonsForPlayer,
  getPlayerCurrentlyPlaying,
  getPlayerJogatinasForCalendar,
  getPlayerParticipationDays,
  getRecentGames,
  getTopGameCover,
  type JogatinaPlayerWithDetails,
  type SeasonParticipantWithDetails,
} from "@/lib/player-profile-helpers";
import type { PlayerPlatinumGame } from "@/lib/types";

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

  const { data: seasonParticipants } = await supabase
    .from("season_participants")
    .select(
      `
      *,
      season:seasons(*, game:games(*))
    `,
    )
    .eq("player_id", id);

  let jogatinaPlayers: JogatinaPlayerWithDetails[];

  try {
    jogatinaPlayers = await fetchPlayerJogatinaPlayers(supabase, id);
  } catch (error) {
    console.error("[loadPlayerProfile] Error fetching player sessions:", error);
    jogatinaPlayers = [];
  }

  const gameJogatinaPlayers = filterGameJogatinaPlayers(jogatinaPlayers);
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

  const { data: platinumGamesRaw } = await supabase
    .from("player_platinum_games")
    .select("*, game:games(id, title, cover_url)")
    .eq("player_id", id)
    .order("created_at", { ascending: false });

  const platinumGames = (platinumGamesRaw ?? []) as PlayerPlatinumGame[];

  return {
    player,
    summary,
    achievements: getPlayerAchievements(summary) ?? [],
    library,
    recentGames: getRecentGames(library, gameJogatinaPlayers),
    participationDays: getPlayerParticipationDays(gameJogatinaPlayers),
    calendarJogatinas: getPlayerJogatinasForCalendar(gameJogatinaPlayers),
    activeSeasons: getActiveSeasonsForPlayer(gameSeasonParticipants),
    bannerCoverUrl: getTopGameCover(library),
    currentlyPlaying: getPlayerCurrentlyPlaying(gameJogatinaPlayers),
    platinumGames,
  };
});
