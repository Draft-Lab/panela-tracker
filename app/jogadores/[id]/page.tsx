import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PlayerProfileHero } from "@/components/player-profile/player-profile-hero";
import { PlayerProfileLayout } from "@/components/player-profile/player-profile-layout";
import { loadPlayerProfile } from "@/lib/load-player-profile";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadPlayerProfile(id);

  if (!data) {
    return {
      title: "Jogador não encontrado",
    };
  }

  const { player, summary, achievements } = data;
  const title = `${player.name} · Panela Tracker`;
  const achievementLabels = (achievements ?? []).map((a) => a.label);
  const description = `${formatPlayerDuration(summary.totalMinutes)} jogados · ${summary.totalSessions} sessões${
    achievementLabels.length > 0
      ? ` · ${achievementLabels.slice(0, 2).join(", ")}`
      : ""
  }`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/jogadores/${id}`,
      type: "profile",
      siteName: "Panela Tracker",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadPlayerProfile(id);

  if (!data) {
    notFound();
  }

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
  } = data;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8 lg:py-10">
        <PlayerProfileHero
          player={player}
          achievements={achievements}
          totalMinutes={summary.totalMinutes}
          bannerCoverUrl={bannerCoverUrl}
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
