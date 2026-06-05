import { Gamepad2, Users, Zap, Clock } from "lucide-react"
import { LandingStatCard } from "@/components/landing/landing-stat-card"
import type { Jogatina, Player, Game, Season } from "@/lib/types"

interface LandingHeroProps {
  currentGames: (Jogatina & { game: Game })[]
  players: Player[]
  jogatinas: (Jogatina & { game: Game })[]
  activeSeasons: Season[]
}

export function LandingHero({
  currentGames,
  players,
  jogatinas,
}: LandingHeroProps) {
  const totalMinutes = jogatinas.reduce(
    (acc, j) => acc + (j.total_duration_minutes || 0),
    0,
  )
  const totalHours = Math.floor(totalMinutes / 60)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekJogatinas = jogatinas.filter((j) => new Date(j.date) >= weekAgo)

  const gameCounts = weekJogatinas.reduce(
    (acc, jogatina) => {
      const gameId = jogatina.game.id
      acc[gameId] = (acc[gameId] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostPlayedGameId = Object.entries(gameCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0]
  const mostPlayedThisWeek = mostPlayedGameId
    ? weekJogatinas.find((j) => j.game.id === mostPlayedGameId)?.game.title ||
      "Nenhum"
    : "Nenhum"

  return (
    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
      <div className="max-w-lg">
        <p className="text-sm font-medium text-primary">Resumo ao vivo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Dashboard do grupo
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
          Jogatinas ativas, tempo total e o jogo mais jogado esta semana.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <LandingStatCard
          label="Jogatinas ativas"
          value={currentGames.length}
          hint="Agora"
          icon={Zap}
        />
        <LandingStatCard
          label="Jogadores"
          value={players.length}
          hint="No grupo"
          icon={Users}
        />
        <LandingStatCard
          label="Mais jogado"
          value={mostPlayedThisWeek}
          hint="Esta semana"
          icon={Gamepad2}
        />
        <LandingStatCard
          label="Tempo total"
          value={`${totalHours}h`}
          hint="Histórico do grupo"
          icon={Clock}
        />
      </div>
    </div>
  )
}
