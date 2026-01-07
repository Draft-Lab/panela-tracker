import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/stats-cards";
import { PlayerStatsTable } from "@/components/player-stats-table";
import { GameStatsTable } from "@/components/game-stats-table";
import { QuickActions } from "@/components/quick-actions";
import { RecentActivity } from "@/components/recent-activity";
import { TopPlayers } from "@/components/top-players";
import { TopGames } from "@/components/top-games";
import { ActivityChart } from "@/components/activity-chart";
import { ActiveSeasonsWidget } from "@/components/active-seasons-widget";
import { calculateStatusStats } from "@/lib/status-helpers";

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
    .select("*, game:games(*)")
    .order("date", { ascending: false });
  const { data: jogatinaPlayers } = await supabase.from("jogatina_players")
    .select(`
      *,
      player:players(*),
      jogatina:jogatinas(*, game:games(*))
    `);

  // Buscar temporadas ativas
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

  // Buscar todos os season_participants para cálculos
  const { data: allSeasonParticipants } = await supabase
    .from("season_participants")
    .select("*");

  // Calcular estatísticas usando a nova lógica
  const stats = calculateStatusStats(
    jogatinaPlayers || [],
    allSeasonParticipants || [],
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-12 h-px bg-primary/40" />
        <div className="absolute top-0 left-0 w-px h-12 bg-primary/40" />
        <div className="absolute top-0 right-0 w-12 h-px bg-primary/40" />
        <div className="absolute top-0 right-0 w-px h-12 bg-primary/40" />
        
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-balance">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Visão completa das suas sessões de jogo e estatísticas dos jogadores
          </p>
        </div>

        <QuickActions players={players || []} games={games || []} />
      </div>

      {/* Main Stats Cards */}
      <div className="relative">
        <div className="relative inline-block mb-6">
          {/* Decorative corner lines for section title */}
          <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
          <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
          <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
          <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
          <h2 className="text-2xl font-bold relative">Visão Geral</h2>
        </div>
        <StatsCards
          totalPlayers={players?.length || 0}
          totalGames={games?.length || 0}
          totalJogatinas={jogatinas?.length || 0}
          totalParticipations={stats.totalParticipations}
          dropRate={stats.dropRate}
          dropCount={stats.dropos}
          zeroCount={stats.zeros}
          davaCount={stats.davaJogar}
        />
      </div>

      {/* Active Seasons Widget */}
      {activeSeasons && activeSeasons.length > 0 && (
        <div className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Temporadas em Andamento</h2>
          </div>
          <ActiveSeasonsWidget seasons={activeSeasons} />
        </div>
      )}

      {/* Activity Chart */}
      <div className="relative">
        <div className="relative inline-block mb-6">
          {/* Decorative corner lines for section title */}
          <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
          <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
          <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
          <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
          <h2 className="text-2xl font-bold relative">Atividade ao Longo do Tempo</h2>
        </div>
        <ActivityChart jogatinas={jogatinas || []} />
      </div>

      {/* Two Column Layout for Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Top Jogadores</h2>
          </div>
          <TopPlayers
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </div>

        <div className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Jogos Mais Jogados</h2>
          </div>
          <TopGames
            jogatinas={jogatinas || []}
            jogatinaPlayers={jogatinaPlayers || []}
          />
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="relative">
        <div className="relative inline-block mb-6">
          {/* Decorative corner lines for section title */}
          <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
          <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
          <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
          <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
          <h2 className="text-2xl font-bold relative">Atividades Recentes</h2>
        </div>
        <RecentActivity jogatinas={jogatinas?.slice(0, 10) || []} />
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Estatísticas por Jogador</h2>
          </div>
          <PlayerStatsTable
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </div>

        <div className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Estatísticas por Jogo</h2>
          </div>
          <GameStatsTable
            jogatinas={jogatinas || []}
            jogatinaPlayers={jogatinaPlayers || []}
          />
        </div>
      </div>
    </div>
  );
}
