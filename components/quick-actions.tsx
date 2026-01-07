"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, Gamepad2, Plus, PlayCircle } from "lucide-react"
import { AddPlayerDialog } from "@/components/add-player-dialog"
import { AddGameDialog } from "@/components/add-game-dialog"
import { AddJogatina } from "@/components/add-jogatina"
import { AddCurrentGameDialog } from "@/components/add-current-game-dialog"
import type { Player, Game } from "@/lib/types"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  players: Player[]
  games: Game[]
}

export function QuickActions({ players, games }: QuickActionsProps) {
  const [showPlayerDialog, setShowPlayerDialog] = useState(false)
  const [showGameDialog, setShowGameDialog] = useState(false)
  const [showJogatinaDialog, setShowJogatinaDialog] = useState(false)
  const [showCurrentGameDialog, setShowCurrentGameDialog] = useState(false)

  const canStartGame = games.length > 0 && players.length > 0

  return (
    <>
      <div className="flex items-center gap-2 mt-4">
        <Button
          onClick={() => setShowCurrentGameDialog(true)}
          disabled={!canStartGame}
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <PlayCircle className="h-3.5 w-3.5" />
          Iniciar Jogo
        </Button>
        <Button
          onClick={() => setShowPlayerDialog(true)}
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Perfil
        </Button>
        <Button
          onClick={() => setShowGameDialog(true)}
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Gamepad2 className="h-3.5 w-3.5" />
          Jogo
        </Button>
        <Button
          onClick={() => setShowJogatinaDialog(true)}
          disabled={!canStartGame}
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Jogatina
        </Button>
        {!canStartGame && (
          <span className="text-xs text-muted-foreground ml-2">
            {games.length === 0 && players.length === 0
              ? "• Adicione jogadores e jogos"
              : games.length === 0
                ? "• Adicione um jogo"
                : "• Adicione um jogador"}
          </span>
        )}
      </div>

      <AddPlayerDialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog} />
      <AddGameDialog open={showGameDialog} onOpenChange={setShowGameDialog} />
      <AddCurrentGameDialog open={showCurrentGameDialog} onOpenChange={setShowCurrentGameDialog} />
      {showJogatinaDialog && (
        <AddJogatina games={games} players={players} open={showJogatinaDialog} onOpenChange={setShowJogatinaDialog} />
      )}
    </>
  )
}
