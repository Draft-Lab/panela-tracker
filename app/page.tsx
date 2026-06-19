import { createClient } from "@/lib/supabase/server";
import { fetchAllJogatinaPlayers } from "@/lib/fetch-all-jogatina-players";
import { LandingHero } from "@/components/landing-hero";
import { LandingCurrentGamesSection } from "@/components/landing-current-games-section";
import { LandingTimelineSection } from "@/components/landing-timeline-section";
import { LandingGroupMetrics } from "@/components/landing-group-metrics";
import { LandingPlayerProfiles } from "@/components/landing-player-profiles";
import { LandingHighlights } from "@/components/landing-highlights";
import { LandingTopGames } from "@/components/landing-top-games";
import { HallOfShame } from "@/components/hall-of-shame";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { ActivitySummaryCards } from "@/components/activity-summary-cards";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingSection } from "@/components/landing/landing-section";

export default async function LandingPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: jogatinas } = await supabase
    .from("jogatinas")
    .select(`*, game:games(*), jogatina_players(*, player:players(*))`)
    .order("date", { ascending: false });

  let jogatinaPlayers: Awaited<ReturnType<typeof fetchAllJogatinaPlayers>> = [];

  try {
    jogatinaPlayers = await fetchAllJogatinaPlayers(supabase);
  } catch (error) {
    console.error("[LandingPage] Error fetching jogatina players:", error);
  }

  const { data: activeSeasons } = await supabase
    .from("seasons")
    .select(
      `
      *,
      game:games(*),
      season_participants(
        *,
        player:players(*)
      )
    `,
    )
    .eq("is_active", true)
    .order("started_at", { ascending: false });

  const { data: allSeasonParticipants } = await supabase.from(
    "season_participants",
  ).select(`
      *,
      player:players(*),
      season:seasons(*, game:games(*))
    `);

  const gameJogatinas = jogatinas?.filter((j) => !j.game?.is_app) || [];
  const gameJogatinaPlayers =
    jogatinaPlayers?.filter((jp) => !jp.jogatina?.game?.is_app) || [];
  const currentGames = gameJogatinas.filter((j) => j.is_current);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="mx-auto max-w-7xl px-4 lg:px-8">
        <section id="overview" className="scroll-mt-[7.5rem] pt-8 pb-4 lg:pt-10">
          <LandingHero
            currentGames={currentGames}
            players={players || []}
            jogatinas={gameJogatinas}
            activeSeasons={activeSeasons || []}
          />
        </section>

        <LandingSection
          id="agora"
          title="O que estamos jogando"
          description="Sessões em andamento e quem está online agora."
        >
          <LandingCurrentGamesSection
            currentGames={currentGames}
            isInteractive={false}
          />
        </LandingSection>

        <LandingSection
          id="jogos"
          title="Jogos do grupo"
          description="Os três jogos com mais sessões em que 2 ou mais pessoas jogaram juntas."
          tone="muted"
          className="mb-8 lg:mb-10"
        >
          <LandingTopGames
            jogatinas={gameJogatinas}
            jogatinaPlayers={gameJogatinaPlayers}
          />
        </LandingSection>

        <LandingSection
          id="atividade"
          title="Atividade ao longo do tempo"
          description="Heatmap dos últimos 12 meses e resumo de frequência."
          tone="muted"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
            <ActivityHeatmap jogatinas={gameJogatinas} />
            <ActivitySummaryCards jogatinas={gameJogatinas} />
          </div>
        </LandingSection>

        <LandingSection
          id="vergonha"
          title="Hall da vergonha"
          description="Os três maiores dropadores do grupo."
        >
          <HallOfShame
            jogatinaPlayers={gameJogatinaPlayers}
            seasonParticipants={allSeasonParticipants || []}
          />
        </LandingSection>

        <LandingSection
          id="timeline"
          title="Timeline global"
          description="Últimos eventos registrados pelo grupo."
          tone="muted"
        >
          <LandingTimelineSection
            jogatinas={gameJogatinas}
            jogatinaPlayers={gameJogatinaPlayers}
          />
        </LandingSection>

        <LandingSection
          id="metricas"
          title="Como a gente joga"
          description="Distribuição de status e duração média das sessões."
        >
          <LandingGroupMetrics
            jogatinaPlayers={gameJogatinaPlayers}
            seasonParticipants={allSeasonParticipants || []}
          />
        </LandingSection>

        <LandingSection
          id="perfis"
          title="Perfis do grupo"
          description="Tempo total, sessões e comportamento de cada membro."
          tone="muted"
        >
          <LandingPlayerProfiles
            players={players || []}
            jogatinaPlayers={gameJogatinaPlayers}
            seasonParticipants={allSeasonParticipants || []}
          />
        </LandingSection>

        <LandingSection
          id="destaques"
          title="Momentos marcantes"
          description="Recordes raros: quem voltou, quem lotou a sessão e quem zerou de verdade."
        >
          <LandingHighlights
            jogatinas={gameJogatinas}
            jogatinaPlayers={gameJogatinaPlayers}
            seasonParticipants={allSeasonParticipants || []}
          />
        </LandingSection>
      </main>

      <LandingFooter />
    </div>
  );
}
