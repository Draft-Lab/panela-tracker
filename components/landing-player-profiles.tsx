import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Player, JogatinaPlayer, SeasonParticipant } from "@/lib/types"

interface LandingPlayerProfilesProps {
  players: Player[]
  jogatinaPlayers: JogatinaPlayer[]
  seasonParticipants: SeasonParticipant[]
}

export function LandingPlayerProfiles({ players, jogatinaPlayers, seasonParticipants }: LandingPlayerProfilesProps) {
  const playerStats = players.map((player) => {
    const playerJogatinas = jogatinaPlayers.filter((jp) => jp.player_id === player.id)
    const playerSeasons = seasonParticipants.filter((sp) => sp.player_id === player.id)

    const totalSessions = playerJogatinas.length + playerSeasons.length
    const totalMinutes =
      playerJogatinas.reduce((acc, jp) => acc + (jp.total_duration_minutes || 0), 0) +
      playerSeasons.reduce((acc, sp) => acc + (sp.total_duration_minutes || 0), 0)

    const dropCount =
      playerJogatinas.filter((jp) => jp.status === "Dropo").length +
      playerSeasons.filter((sp) => sp.status === "Dropo").length

    // Definir tags comportamentais
    const tags: string[] = []
    if (dropCount === 0 && totalSessions > 5) tags.push("Finalizador")
    if (totalMinutes > totalSessions * 60) tags.push("Dedicado")
    if (dropCount > totalSessions * 0.3) tags.push("Explorador")
    if (totalSessions > 20) tags.push("Veterano")
    if (tags.length === 0) tags.push("Casual")

    return { player, totalSessions, totalMinutes, dropCount, tags }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playerStats.map((stat) => (
        <Card key={stat.player.id} className="relative group hover:border-primary transition-colors">
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
            <CardTitle className="text-base">{stat.player.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Sessões</p>
                <p className="text-2xl font-bold">{stat.totalSessions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Drops</p>
                <p className="text-2xl font-bold text-red-500">{stat.dropCount}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {stat.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
