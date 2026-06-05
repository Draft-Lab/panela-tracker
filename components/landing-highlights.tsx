import { Badge } from "@/components/ui/badge"
import { Trophy, Flame, Target } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer, Season, SeasonParticipant } from "@/lib/types"

interface LandingHighlightsProps {
  jogatinas: (Jogatina & { game: Game })[]
  jogatinaPlayers: JogatinaPlayer[]
  seasons: Season[]
  seasonParticipants: SeasonParticipant[]
}

export function LandingHighlights({ jogatinas, jogatinaPlayers, seasons, seasonParticipants }: LandingHighlightsProps) {
  const longestSession =
    jogatinas.length > 0
      ? jogatinas.reduce((prev, current) =>
          (current.total_duration_minutes || 0) > (prev.total_duration_minutes || 0) ? current : prev,
        )
      : null

  const mostIntenseSeason =
    seasons.length > 0
      ? seasons.reduce((prev, current) => {
          const prevParticipants = seasonParticipants.filter((sp) => sp.season_id === prev.id).length
          const currentParticipants = seasonParticipants.filter((sp) => sp.season_id === current.id).length
          return currentParticipants > prevParticipants ? current : prev
        })
      : null

  const gameDrops = jogatinas.reduce(
    (acc, jogatina) => {
      const gameId = jogatina.game_id
      const drops = jogatinaPlayers.filter((jp) => jp.jogatina_id === jogatina.id && jp.status === "Dropo").length
      if (!acc[gameId]) {
        acc[gameId] = { game: jogatina.game, drops: 0 }
      }
      acc[gameId].drops += drops
      return acc
    },
    {} as Record<string, { game: Game; drops: number }>,
  )

  const mostAbandonedGame =
    Object.values(gameDrops).length > 0
      ? Object.values(gameDrops).reduce((prev, current) => (current.drops > prev.drops ? current : prev))
      : null

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
      {longestSession && (
        <div className="border-l-2 border-yellow-500/60 pl-4">
          <p className="flex items-center gap-2 text-sm font-medium text-yellow-500">
            <Trophy className="h-4 w-4" />
            Maratona
          </p>
          <p className="mt-2 font-medium">{longestSession.game.title}</p>
          <Badge variant="outline" className="mt-2">
            {longestSession.total_duration_minutes ? Math.floor(longestSession.total_duration_minutes / 60) : 0}h
          </Badge>
        </div>
      )}

      {mostAbandonedGame && (
        <div className="border-l-2 border-red-500/60 pl-4">
          <p className="flex items-center gap-2 text-sm font-medium text-red-500">
            <Flame className="h-4 w-4" />
            Mais abandonado
          </p>
          <p className="mt-2 font-medium">{mostAbandonedGame.game.title}</p>
          <Badge variant="outline" className="mt-2">
            {mostAbandonedGame.drops} drops
          </Badge>
        </div>
      )}

      {mostIntenseSeason && (
        <div className="border-l-2 border-green-500/60 pl-4">
          <p className="flex items-center gap-2 text-sm font-medium text-green-500">
            <Target className="h-4 w-4" />
            Season intensa
          </p>
          <p className="mt-2 font-medium">{mostIntenseSeason.name}</p>
          <Badge variant="outline" className="mt-2">
            {seasonParticipants.filter((sp) => sp.season_id === mostIntenseSeason.id).length} players
          </Badge>
        </div>
      )}
    </div>
  )
}
