import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Users } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer } from "@/lib/types"
import { calculateTopGames } from "@/lib/game-stats-helpers"
import Image from "next/image"

interface TopGamesProps {
  jogatinas: (Jogatina & { game: Game })[]
  jogatinaPlayers: JogatinaPlayer[]
}

export function TopGames({ jogatinas, jogatinaPlayers }: TopGamesProps) {
  const topGames = calculateTopGames(jogatinas, jogatinaPlayers)

  if (topGames.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhuma sessão em grupo registrada ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Ranking de Jogos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topGames.map((stat, index) => (
            <div key={stat.game.id} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                {index + 1}
              </div>
              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {stat.game.cover_url ? (
                  <Image
                    src={stat.game.cover_url || "/placeholder.svg"}
                    alt={stat.game.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{stat.game.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {stat.participations} participações
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stat.sessions}</p>
                <p className="text-xs text-muted-foreground">sessões</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
