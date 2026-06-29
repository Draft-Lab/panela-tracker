import { PlayerProfileAdminActions } from "@/components/player-profile/player-profile-admin-actions";
import { PlayerProfileAdminMeta } from "@/components/player-profile/player-profile-admin-meta";
import { PlayerProfileHero } from "@/components/player-profile/player-profile-hero";
import { PlayerProfileLayout } from "@/components/player-profile/player-profile-layout";
import { splitPlatinumGames } from "@/lib/player-platinum-helpers";
import type { loadPlayerProfile } from "@/lib/load-player-profile";

type PlayerProfileData = NonNullable<Awaited<ReturnType<typeof loadPlayerProfile>>>;

interface PlayerProfileContentProps {
  data: PlayerProfileData;
  variant?: "public" | "admin";
}

export function PlayerProfileContent({
  data,
  variant = "public",
}: PlayerProfileContentProps) {
  const {
    player,
    summary,
    achievements,
    library,
    recentGames,
    participationDays,
    calendarJogatinas,
    activeSeasons,
    bannerCoverUrl,
    currentlyPlaying,
    platinumGames,
  } = data;

  const { platinando, platinados } = splitPlatinumGames(platinumGames);
  const isAdmin = variant === "admin";

  return (
    <>
      <PlayerProfileHero
        player={player}
        achievements={achievements}
        totalMinutes={summary.totalMinutes}
        totalSessions={summary.totalSessions}
        uniqueGames={summary.uniqueGames}
        bannerCoverUrl={bannerCoverUrl}
        metaExtra={
          isAdmin ? <PlayerProfileAdminMeta discordId={player.discord_id} /> : undefined
        }
        actions={isAdmin ? <PlayerProfileAdminActions player={player} /> : undefined}
        currentlyPlaying={currentlyPlaying}
        platinando={platinando}
        platinadosCount={platinados.length}
      />

      <PlayerProfileLayout
        summary={summary}
        seasons={activeSeasons}
        library={library}
        recentGames={recentGames}
        participationDays={participationDays}
        calendarJogatinas={calendarJogatinas}
        platinando={platinando}
        platinados={platinados}
      />
    </>
  );
}
