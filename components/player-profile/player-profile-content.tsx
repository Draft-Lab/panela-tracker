import { PlayerProfileAdminActions } from "@/components/player-profile/player-profile-admin-actions";
import { PlayerProfileAdminMeta } from "@/components/player-profile/player-profile-admin-meta";
import { PlayerProfileHero } from "@/components/player-profile/player-profile-hero";
import { PlayerProfileLayout } from "@/components/player-profile/player-profile-layout";
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
  } = data;

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
        backHref={isAdmin ? "/dashboard/jogadores" : "/#perfis"}
        backLabel={isAdmin ? "Voltar para Jogadores" : "Voltar aos perfis"}
        metaExtra={
          isAdmin ? <PlayerProfileAdminMeta discordId={player.discord_id} /> : undefined
        }
        actions={isAdmin ? <PlayerProfileAdminActions player={player} /> : undefined}
        currentlyPlaying={currentlyPlaying}
      />

      <PlayerProfileLayout
        summary={summary}
        seasons={activeSeasons}
        library={library}
        recentGames={recentGames}
        participationDays={participationDays}
        calendarJogatinas={calendarJogatinas}
      />
    </>
  );
}
