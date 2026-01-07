import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  // Jogatina mais longa
  const longestSession =
    jogatinas.length > 0
      ? jogatinas.reduce((prev, current) =>
          (current.total_duration_minutes || 0) > (prev.total_duration_minutes || 0) ? current : prev,
        )
      : null

  // Season mais intensa (mais participantes)
  const mostIntenseSeason =
    seasons.length > 0
      ? seasons.reduce((prev, current) => {
          const prevParticipants = seasonParticipants.filter((sp) => sp.season_id === prev.id).length
          const currentParticipants = seasonParticipants.filter((sp) => sp.season_id === current.id).length
          return currentParticipants > prevParticipants ? current : prev
        })
      : null

  // Jogo mais abandonado
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {longestSession && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Maratona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{longestSession.game.title}</p>
            <Badge variant="outline" className="mt-2">
              {longestSession.total_duration_minutes ? Math.floor(longestSession.total_duration_minutes / 60) : 0}h
            </Badge>
          </CardContent>
        </Card>
      )}

      {mostAbandonedGame && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              Mais Abandonado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{mostAbandonedGame.game.title}</p>
            <Badge variant="outline" className="mt-2">
              {mostAbandonedGame.drops} drops
            </Badge>
          </CardContent>
        </Card>
      )}

      {mostIntenseSeason && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Season Intensa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{mostIntenseSeason.name}</p>
            <Badge variant="outline" className="mt-2">
              {seasonParticipants.filter((sp) => sp.season_id === mostIntenseSeason.id).length} players
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
