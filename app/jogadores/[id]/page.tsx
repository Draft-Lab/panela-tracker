import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PlayerProfileHero } from "@/components/player-profile/player-profile-hero";
import { PlayerProfileLayout } from "@/components/player-profile/player-profile-layout";
import {
  buildPlayerGameLibrary,
  buildPlayerProfileSummary,
  filterGameJogatinaPlayers,
  filterGameSeasonParticipants,
  getActiveSeasonsForPlayer,
  getPlayerJogatinasForCalendar,
  getPlayerParticipationDays,
  getPlayerTags,
  getRecentGames,
  getTopGameCover,
  type JogatinaPlayerWithDetails,
  type SeasonParticipantWithDetails,
} from "@/lib/player-profile-helpers";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (playerError || !player) {
    notFound();
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
  const tags = getPlayerTags(summary);
  const library = buildPlayerGameLibrary(
    gameJogatinaPlayers,
    gameSeasonParticipants,
  );
  const recentGames = getRecentGames(library);
  const participationDays = getPlayerParticipationDays(gameJogatinaPlayers);
  const calendarJogatinas = getPlayerJogatinasForCalendar(gameJogatinaPlayers);
  const activeSeasons = getActiveSeasonsForPlayer(gameSeasonParticipants);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8 lg:py-10">
        <PlayerProfileHero
          player={player}
          tags={tags}
          totalMinutes={summary.totalMinutes}
          bannerCoverUrl={getTopGameCover(library)}
        />

        <PlayerProfileLayout
          summary={summary}
          seasons={activeSeasons}
          library={library}
          recentGames={recentGames}
          participationDays={participationDays}
          calendarJogatinas={calendarJogatinas}
        />
      </main>

      <LandingFooter />
    </div>
  );
}
