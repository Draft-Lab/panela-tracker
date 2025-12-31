"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Users, CheckCircle2 } from "lucide-react"
import { FinishCurrentGameDialog } from "./finish-current-game-dialog"
import type { JogatinaWithDetails } from "@/lib/types"

interface ManageCurrentGamesProps {
  currentJogatinas: JogatinaWithDetails[]
}

export function ManageCurrentGames({ currentJogatinas }: ManageCurrentGamesProps) {
  const [finishingGame, setFinishingGame] = useState<{ id: string; title: string } | null>(null)

  if (!currentJogatinas || currentJogatinas.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Nenhum jogo em andamento</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentJogatinas.map((jogatina) => (
          <Card key={jogatina.id} className="overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {jogatina.game?.cover_url ? (
                <img
                  src={jogatina.game.cover_url || "/placeholder.svg"}
                  alt={jogatina.game?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Gamepad2 className="h-16 w-16 text-primary/40" />
              )}
              <Badge className="absolute top-2 right-2 animate-pulse bg-green-500 hover:bg-green-600">Em Jogo</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{jogatina.game?.title || "Sem título"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{jogatina.jogatina_players?.length || 0} jogadores</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {jogatina.jogatina_players?.map((jp) => (
                  <div key={jp.id} className="flex items-center gap-1.5">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={jp.player?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {jp.player?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{jp.player?.name}</span>
                  </div>
                ))}
              </div>
              {jogatina.notes && <p className="text-sm text-muted-foreground italic">{jogatina.notes}</p>}
              <Button
                className="w-full mt-2 bg-transparent"
                variant="outline"
                onClick={() => setFinishingGame({ id: jogatina.id, title: jogatina.game?.title || "Jogo" })}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar Jogo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {finishingGame && (
        <FinishCurrentGameDialog
          jogatinaId={finishingGame.id}
          gameTitle={finishingGame.title}
          open={!!finishingGame}
          onOpenChange={(open) => !open && setFinishingGame(null)}
        />
      )}
    </>
  )
}
