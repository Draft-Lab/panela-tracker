import { createClient } from "@/lib/supabase/server";
import { DashboardPlayerStatsGrid } from "@/components/dashboard/dashboard-player-stats-grid";
import { DashboardGameStatsGrid } from "@/components/dashboard/dashboard-game-stats-grid";
import { QuickActions } from "@/components/quick-actions";
import { TopPlayers } from "@/components/top-players";
import { ActivityChart } from "@/components/activity-chart";
import { ActiveSeasonsWidget } from "@/components/active-seasons-widget";
import { calculateStatusStats } from "@/lib/status-helpers";
import { RetrospectiveTeaser } from "@/components/retrospective/retrospective-teaser";
import {
  buildMonthlyRetrospective,
  buildYearSummary,
} from "@/lib/retrospective-helpers";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardStatsOverview } from "@/components/dashboard/dashboard-stats-overview";
import { LandingTopGames } from "@/components/landing-top-games";
import { LandingTimelineSection } from "@/components/landing-timeline-section";
import { ActivitySummaryCards } from "@/components/activity-summary-cards";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: jogatinas } = await supabase
    .from("jogatinas")
    .select(`
      *,
      game:games(*),
      jogatina_players(*, player:players(*))
    `)
    .order("date", { ascending: false });
  const { data: jogatinaPlayers } = await supabase.from("jogatina_players")
    .select(`
      *,
      player:players(*),
      jogatina:jogatinas(*, game:games(*))
    `);

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

  const { data: allSeasonParticipants } = await supabase
    .from("season_participants")
    .select("*");

  const gameOnly = games?.filter((g) => !g.is_app) || [];
  const gameJogatinas = jogatinas?.filter((j) => !j.game?.is_app) || [];
  const gameJogatinaPlayers =
    jogatinaPlayers?.filter((jp) => !jp.jogatina?.game?.is_app) || [];

  const stats = calculateStatusStats(
    gameJogatinaPlayers,
    allSeasonParticipants || [],
  );

  const currentYear = new Date().getFullYear();
  const retrospectiveSummary = buildYearSummary(
    gameJogatinas,
    gameJogatinaPlayers,
    currentYear,
  );
  const retrospectiveMonths = buildMonthlyRetrospective(
    gameJogatinas,
    gameJogatinaPlayers,
    currentYear,
  );

  return (
    <div className="space-y-10">
      <div className="relative">
        <div className="absolute top-0 left-0 h-px w-12 bg-primary/40" />
        <div className="absolute top-0 left-0 h-12 w-px bg-primary/40" />
        <div className="absolute top-0 right-0 h-px w-12 bg-primary/40" />
        <div className="absolute top-0 right-0 h-12 w-px bg-primary/40" />

        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-balance text-foreground md:text-5xl">
            Dashboard
          </h1>
          <p className="text-base text-muted-foreground text-balance sm:text-lg">
            Resumo do grupo, jogos em destaque e atividade recente
          </p>
        </div>

        <QuickActions players={players || []} games={games || []} />
      </div>

      <RetrospectiveTeaser
        summary={retrospectiveSummary}
        months={retrospectiveMonths}
      />

      <DashboardSection
        title="Visão geral"
        description="Números consolidados do grupo."
      >
        <DashboardStatsOverview
          totalPlayers={players?.length || 0}
          totalGames={gameOnly.length}
          totalJogatinas={gameJogatinas.length}
          totalParticipations={stats.totalParticipations}
          dropRate={stats.dropRate}
          dropCount={stats.dropos}
          zeroCount={stats.zeros}
          davaCount={stats.davaJogar}
        />
      </DashboardSection>

      {activeSeasons && activeSeasons.length > 0 && (
        <DashboardSection
          title="Temporadas em andamento"
          description="Campanhas ativas no momento."
        >
          <ActiveSeasonsWidget seasons={activeSeasons} />
        </DashboardSection>
      )}

      <DashboardSection
        title="Atividade"
        description="Últimos 6 meses e resumo de frequência."
      >
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 lg:grid lg:grid-cols-[minmax(0,1fr)_220px]">
          <ActivityChart
            jogatinas={gameJogatinas}
            compact
            borderless
          />
          <div className="border-t border-border/50 px-4 py-2 lg:border-t-0 lg:border-l">
            <ActivitySummaryCards jogatinas={gameJogatinas} className="lg:pl-2" />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Jogos mais jogados"
        description="Sessões em grupo com 2 ou mais jogadores — capas, gênero e ranking."
      >
        <LandingTopGames
          jogatinas={gameJogatinas}
          jogatinaPlayers={gameJogatinaPlayers}
          showExtended={false}
        />
      </DashboardSection>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DashboardSection
          title="Top jogadores"
          description="Quem mais participou das jogatinas."
        >
          <TopPlayers
            jogatinaPlayers={gameJogatinaPlayers}
            seasonParticipants={allSeasonParticipants || []}
          />
        </DashboardSection>

        <DashboardSection
          title="Atividades recentes"
          description="As 3 jogatinas mais recentes."
        >
          <div className="rounded-xl border border-border/50 bg-card/20 p-4 sm:p-5">
            <LandingTimelineSection
              jogatinas={gameJogatinas}
              jogatinaPlayers={gameJogatinaPlayers}
              limit={3}
              compact
            />
          </div>
        </DashboardSection>
      </div>

      <div className="space-y-8 border-t border-border/50 pt-8">
        <DashboardSection
          title="Estatísticas por jogador"
          description="Resumo individual com drops, zeros e taxa de drop."
        >
          <DashboardPlayerStatsGrid
            jogatinaPlayers={gameJogatinaPlayers}
            seasonParticipants={allSeasonParticipants || []}
          />
        </DashboardSection>

        <DashboardSection
          title="Estatísticas por jogo"
          description="Sessões, participações e status por título."
        >
          <DashboardGameStatsGrid
            jogatinas={gameJogatinas}
            jogatinaPlayers={gameJogatinaPlayers}
            limit={12}
          />
        </DashboardSection>
      </div>
    </div>
  );
}
