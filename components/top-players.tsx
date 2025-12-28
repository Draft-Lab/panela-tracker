import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingDown, Award } from "lucide-react"
import type { JogatinaPlayer, Player, Jogatina } from "@/lib/types"

interface TopPlayersProps {
  jogatinaPlayers: (JogatinaPlayer & { player: Player; jogatina: Jogatina })[]
}

export function TopPlayers({ jogatinaPlayers }: TopPlayersProps) {
  const playerStats = jogatinaPlayers.reduce(
    (acc, jp) => {
      const playerId = jp.player.id
      if (!acc[playerId]) {
        acc[playerId] = {
          player: jp.player,
          total: 0,
          drops: 0,
          zeros: 0,
          dava: 0,
        }
      }
      acc[playerId].total++
      if (jp.status === "Dropo") acc[playerId].drops++
      if (jp.status === "Zero") acc[playerId].zeros++
      if (jp.status === "Dava pra jogar") acc[playerId].dava++
      return acc
    },
    {} as Record<
      string,
      {
        player: Player
        total: number
        drops: number
        zeros: number
        dava: number
      }
    >,
  )

  const topPlayers = Object.values(playerStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  if (topPlayers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhum jogador registrado ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking de Participação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPlayers.map((stat, index) => (
            <div key={stat.player.id} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={stat.player.avatar_url || undefined} alt={stat.player.name} />
                <AvatarFallback>{stat.player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{stat.player.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                    {stat.drops} drops
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1 text-green-500" />
                    {stat.zeros} zeros
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stat.total}</p>
                <p className="text-xs text-muted-foreground">jogatinas</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
