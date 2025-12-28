import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/stats-cards"
import { PlayerStatsTable } from "@/components/player-stats-table"
import { GameStatsTable } from "@/components/game-stats-table"
import { QuickActions } from "@/components/quick-actions"
import { RecentActivity } from "@/components/recent-activity"
import { TopPlayers } from "@/components/top-players"
import { TopGames } from "@/components/top-games"
import { ActivityChart } from "@/components/activity-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: players } = await supabase.from("players").select("*").order("created_at", { ascending: false })
  const { data: games } = await supabase.from("games").select("*").order("created_at", { ascending: false })
  const { data: jogatinas } = await supabase
    .from("jogatinas")
    .select("*, game:games(*)")
    .order("date", { ascending: false })
  const { data: jogatinaPlayers } = await supabase.from("jogatina_players").select(`
      *,
      player:players(*),
      jogatina:jogatinas(*, game:games(*))
    `)

  const dropCount = jogatinaPlayers?.filter((jp) => jp.status === "Dropo").length || 0
  const zeroCount = jogatinaPlayers?.filter((jp) => jp.status === "Zero").length || 0
  const davaCount = jogatinaPlayers?.filter((jp) => jp.status === "Dava pra jogar").length || 0
  const dropRate = jogatinaPlayers?.length ? ((dropCount / jogatinaPlayers.length) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-balance">Dashboard</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Visão completa das suas sessões de jogo e estatísticas dos jogadores
          </p>
        </div>

        <QuickActions players={players || []} games={games || []} />
      </div>

      {/* Main Stats Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
        <StatsCards
          totalPlayers={players?.length || 0}
          totalGames={games?.length || 0}
          totalJogatinas={jogatinas?.length || 0}
          totalParticipations={jogatinaPlayers?.length || 0}
          dropRate={dropRate}
          dropCount={dropCount}
          zeroCount={zeroCount}
          davaCount={davaCount}
        />
      </div>

      {/* Activity Chart */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Atividade ao Longo do Tempo</h2>
        <ActivityChart jogatinas={jogatinas || []} />
      </div>

      {/* Two Column Layout for Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Jogadores</h2>
          <TopPlayers jogatinaPlayers={jogatinaPlayers || []} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Jogos Mais Jogados</h2>
          <TopGames jogatinas={jogatinas || []} jogatinaPlayers={jogatinaPlayers || []} />
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Atividades Recentes</h2>
        <RecentActivity jogatinas={jogatinas?.slice(0, 10) || []} />
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Estatísticas por Jogador</h2>
          <PlayerStatsTable jogatinaPlayers={jogatinaPlayers || []} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Estatísticas por Jogo</h2>
          <GameStatsTable jogatinas={jogatinas || []} jogatinaPlayers={jogatinaPlayers || []} />
        </div>
      </div>
    </div>
  )
}
