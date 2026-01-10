import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ArrowLeft, Gamepad2, Clock, Trophy } from "lucide-react"
import type { PlayerGameStats } from "@/lib/types"

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const supabase = await createClient()

  // Buscar dados do jogador
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single()

  if (playerError || !player) {
    notFound()
  }

  // Buscar tempo jogado em cada jogo
  const { data: jogatinaPlayersData } = await supabase
    .from("jogatina_players")
    .select(`
      total_duration_minutes,
      jogatina:jogatinas(
        game:games(
          id,
          title,
          cover_url
        )
      )
    `)
    .eq("player_id", id)

  // Agregar dados por jogo
  const gameStatsMap = new Map<string, PlayerGameStats>()

  jogatinaPlayersData?.forEach((jp: any) => {
    if (!jp.jogatina?.game) return

    const game = jp.jogatina.game
    const gameId = game.id

    if (!gameStatsMap.has(gameId)) {
      gameStatsMap.set(gameId, {
        game_id: gameId,
        game_title: game.title,
        game_cover_url: game.cover_url,
        total_minutes: 0,
        session_count: 0,
      })
    }

    const stats = gameStatsMap.get(gameId)!
    stats.total_minutes += jp.total_duration_minutes || 0
    stats.session_count = (stats.session_count || 0) + 1
  })

  // Converter para array, filtrar apenas jogos com tempo e ordenar por tempo total
  const gameStats = Array.from(gameStatsMap.values())
    .filter((stat) => stat.total_minutes > 0)
    .sort((a, b) => b.total_minutes - a.total_minutes)

  // Calcular estatísticas gerais
  const totalMinutes = gameStats.reduce((acc, stat) => acc + stat.total_minutes, 0)
  const totalGames = gameStats.length
  const totalSessions = gameStats.reduce((acc, stat) => acc + (stat.session_count || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/dashboard/jogadores">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Jogadores
              </Link>
            </Button>

            <div className="flex items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={player.avatar_url || undefined} alt={player.name} />
                <AvatarFallback className="text-4xl">
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {player.name}
                </h1>
                <p className="text-muted-foreground mb-4">
                  Membro desde {new Date(player.created_at).toLocaleDateString("pt-BR")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Tempo Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        Jogos Diferentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{totalGames}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        Sessões Totais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{totalSessions}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Tempo por Jogo</h2>
            {gameStats.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum jogo registrado ainda.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gameStats.map((stat) => (
                  <Card key={stat.game_id} className="hover:shadow-lg transition-shadow overflow-hidden py-0">
                    <div className="aspect-video bg-muted relative">
                      {stat.game_cover_url ? (
                        <img
                          src={stat.game_cover_url || "/placeholder.svg"}
                          alt={stat.game_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="text-4xl font-bold opacity-20">
                            {stat.game_title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{stat.game_title}</CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Tempo: {Math.floor(stat.total_minutes / 60)}h {stat.total_minutes % 60}m
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.session_count} {stat.session_count === 1 ? "sessão" : "sessões"}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
