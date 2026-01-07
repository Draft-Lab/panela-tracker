import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2 } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"

interface LandingTimelineSectionProps {
  jogatinas: (Jogatina & { game: Game })[]
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[]
}

export function LandingTimelineSection({ jogatinas, jogatinaPlayers }: LandingTimelineSectionProps) {
  const recentEvents = jogatinas.slice(0, 8).map((jogatina) => {
    const players = jogatinaPlayers.filter((jp) => jp.jogatina_id === jogatina.id)
    const firstPlayer = players[0]?.player.name || "Alguém"

    return {
      jogatina,
      firstPlayer,
      playerCount: players.length,
    }
  })

  if (recentEvents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhum evento recente</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative group">
      {/* Decorative corner lines */}
      <div className="absolute top-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Timeline Global
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEvents.map((event) => {
            const date = new Date(event.jogatina.date)
            const timeAgo = getTimeAgo(date)

            return (
              <div key={event.jogatina.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    <span className="text-primary">{event.firstPlayer}</span> iniciou uma jogatina em{" "}
                    <span className="text-primary">{event.jogatina.game.title}</span>
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {event.playerCount} jogadores
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {timeAgo}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  return `${diffDays}d atrás`
}
