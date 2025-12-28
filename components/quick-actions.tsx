"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Gamepad2, Plus, PlayCircle } from "lucide-react"
import { AddPlayerDialog } from "@/components/add-player-dialog"
import { AddGameDialog } from "@/components/add-game-dialog"
import { AddJogatina } from "@/components/add-jogatina"
import { AddCurrentGameDialog } from "@/components/add-current-game-dialog"
import type { Player, Game } from "@/lib/types"

interface QuickActionsProps {
  players: Player[]
  games: Game[]
}

export function QuickActions({ players, games }: QuickActionsProps) {
  const [showPlayerDialog, setShowPlayerDialog] = useState(false)
  const [showGameDialog, setShowGameDialog] = useState(false)
  const [showJogatinaDialog, setShowJogatinaDialog] = useState(false)
  const [showCurrentGameDialog, setShowCurrentGameDialog] = useState(false)

  return (
    <>
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowCurrentGameDialog(true)}
              className="gap-2"
              disabled={games.length === 0 || players.length === 0}
            >
              <PlayCircle className="h-4 w-4" />
              Iniciar Jogo Atual
            </Button>
            <Button onClick={() => setShowPlayerDialog(true)} variant="secondary" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Criar Perfil
            </Button>
            <Button onClick={() => setShowGameDialog(true)} variant="secondary" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Adicionar Jogo
            </Button>
            <Button
              onClick={() => setShowJogatinaDialog(true)}
              variant="outline"
              className="gap-2"
              disabled={games.length === 0 || players.length === 0}
            >
              <Plus className="h-4 w-4" />
              Criar Jogatina
            </Button>
          </div>
          {(games.length === 0 || players.length === 0) && (
            <p className="text-sm text-muted-foreground mt-3">
              {games.length === 0 && players.length === 0
                ? "Adicione jogadores e jogos antes de criar uma jogatina"
                : games.length === 0
                  ? "Adicione pelo menos um jogo antes de criar uma jogatina"
                  : "Adicione pelo menos um jogador antes de criar uma jogatina"}
            </p>
          )}
        </CardContent>
      </Card>

      <AddPlayerDialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog} />
      <AddGameDialog open={showGameDialog} onOpenChange={setShowGameDialog} />
      <AddCurrentGameDialog open={showCurrentGameDialog} onOpenChange={setShowCurrentGameDialog} />
      {showJogatinaDialog && (
        <AddJogatina games={games} players={players} open={showJogatinaDialog} onOpenChange={setShowJogatinaDialog} />
      )}
    </>
  )
}
