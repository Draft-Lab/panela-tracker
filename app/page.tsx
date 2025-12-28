import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/stats-cards";
import { PlayerStatsTable } from "@/components/player-stats-table";
import { RecentActivity } from "@/components/recent-activity";
import { TopPlayers } from "@/components/top-players";
import { TopGames } from "@/components/top-games";
import { ActivityChart } from "@/components/activity-chart";
import { HallOfShame } from "@/components/hall-of-shame";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Gamepad2 } from "lucide-react";
import { CurrentGames } from "@/components/current-games";

export default async function LandingPage() {
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

  const dropCount =
    jogatinaPlayers?.filter((jp) => jp.status === "Dropo").length || 0;
  const zeroCount =
    jogatinaPlayers?.filter((jp) => jp.status === "Zero").length || 0;
  const davaCount =
    jogatinaPlayers?.filter((jp) => jp.status === "Dava pra jogar").length || 0;
  const dropRate = jogatinaPlayers?.length
    ? ((dropCount / jogatinaPlayers.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">
                Panela Tracker Só que no Github
              </h1>
              <p className="text-xs text-muted-foreground">
                Estatísticas públicas
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">
              <Lock className="h-4 w-4 mr-2" />
              Área Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 space-y-12">
        {/* Current Games Section */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Jogos Atuais</h2>
          <p className="text-muted-foreground mb-6">
            Veja quais jogos estão sendo jogados agora pela galera
          </p>
          <CurrentGames />
        </div>

        {/* Hall of Shame Section */}
        <HallOfShame jogatinaPlayers={jogatinaPlayers || []} />

        {/* Welcome Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            Acompanhe Nossas Jogatinas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Veja as estatísticas completas das nossas sessões de jogo, descubra
            quem mais dropa e acompanhe nossa jornada gamer
          </p>
        </div>

        {/* Main Stats */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Estatísticas Gerais</h3>
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
          <h3 className="text-2xl font-bold mb-4">
            Atividade ao Longo do Tempo
          </h3>
          <ActivityChart jogatinas={jogatinas || []} />
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">Top Jogadores</h3>
            <TopPlayers jogatinaPlayers={jogatinaPlayers || []} />
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Jogos Mais Jogados</h3>
            <TopGames
              jogatinas={jogatinas || []}
              jogatinaPlayers={jogatinaPlayers || []}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Atividades Recentes</h3>
          <RecentActivity jogatinas={jogatinas?.slice(0, 10) || []} />
        </div>

        {/* Detailed Stats - Player Stats Only */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Estatísticas por Jogador</h3>
          <PlayerStatsTable jogatinaPlayers={jogatinaPlayers || []} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Panela Tracker - Acompanhe suas sessões de jogo com os amigos</p>
        </div>
      </footer>
    </div>
  );
}
