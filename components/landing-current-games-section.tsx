import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Gamepad2 } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface LandingCurrentGamesSectionProps {
  currentGames: (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  })[]
}

export function LandingCurrentGamesSection({ currentGames }: LandingCurrentGamesSectionProps) {
  if (currentGames.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Ninguém está jogando agora</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentGames.map((jogatina) => {
        const activePlayers = jogatina.jogatina_players?.filter((jp) => jp.is_active) || []
        const sessionType = jogatina.session_type === "solo" ? "Solo" : "Grupo"

        return (
          <Card key={jogatina.id} className="overflow-hidden hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-1">{jogatina.game.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="animate-pulse bg-green-500/10 text-green-500 border-green-500/30"
                    >
                      Ao vivo
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        sessionType === "Solo"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                          : "bg-purple-500/10 text-purple-500 border-purple-500/30"
                      }
                    >
                      {sessionType}
                    </Badge>
                  </div>
                </div>
                <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                  {jogatina.game.cover_url ? (
                    <Image
                      src={jogatina.game.cover_url || "/placeholder.svg"}
                      alt={jogatina.game.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{jogatina.active_players} jogador(es) ativo(s)</span>
              </div>

              {activePlayers.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Jogando agora:</p>
                  <div className="flex flex-wrap gap-2">
                    {activePlayers.map((jp) => (
                      <div key={jp.player.id} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {jp.player.avatar_url && (
                            <AvatarImage src={jp.player.avatar_url || "/placeholder.svg"} alt={jp.player.name} />
                          )}
                          <AvatarFallback className="text-xs">
                            {jp.player.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{jp.player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
