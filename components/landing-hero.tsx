import { Card } from "@/components/ui/card"
import { Gamepad2, Users, Zap, Clock } from "lucide-react"
import type { Jogatina, Player, Game, Season } from "@/lib/types"

interface LandingHeroProps {
  currentGames: (Jogatina & { game: Game })[]
  players: Player[]
  jogatinas: (Jogatina & { game: Game })[]
  activeSeasons: Season[]
}

export function LandingHero({ currentGames, players, jogatinas, activeSeasons }: LandingHeroProps) {
  // Calcular tempo total jogado em minutos
  const totalMinutes = jogatinas.reduce((acc, j) => acc + (j.total_duration_minutes || 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)

  // Jogo mais jogado da semana
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekJogatinas = jogatinas.filter((j) => new Date(j.date) >= weekAgo)
  const mostPlayedThisWeek = weekJogatinas.length > 0 ? weekJogatinas[0].game.title : "Nenhum"

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Panela Tracker</h1>
        <p className="text-lg text-muted-foreground">Dashboard ao vivo do grupo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Jogatinas Ativas</p>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{currentGames.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Agora</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Jogadores Ativos</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{players.length}</p>
          <p className="text-xs text-muted-foreground mt-1">No grupo</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Mais Jogado</p>
            <Gamepad2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold line-clamp-1">{mostPlayedThisWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Tempo Total</p>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold">{totalHours}h</p>
          <p className="text-xs text-muted-foreground mt-1">Grupo</p>
        </Card>
      </div>
    </div>
  )
}
