"use client"

import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import { useState } from "react"
import { FinishCurrentGameDialog } from "@/components/finish-current-game-dialog"
import { CurrentGameCard } from "@/components/landing/current-game-card"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import { cn } from "@/lib/utils"

interface LandingCurrentGamesSectionProps {
  currentGames: (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  })[]
  isInteractive?: boolean
}

export function LandingCurrentGamesSection({
  currentGames,
  isInteractive = false,
}: LandingCurrentGamesSectionProps) {
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [selectedJogatinaId, setSelectedJogatinaId] = useState<string | null>(null)
  const [selectedGameTitle, setSelectedGameTitle] = useState<string>("")

  const handleFinishClick = (jogatinaId: string, gameTitle: string) => {
    setSelectedJogatinaId(jogatinaId)
    setSelectedGameTitle(gameTitle)
    setFinishDialogOpen(true)
  }

  if (currentGames.length === 0) {
    return <LandingEmptyState>Ninguém está jogando agora</LandingEmptyState>
  }

  return (
    <>
      <div
        className={cn(
          "grid gap-3",
          currentGames.length > 1 && "lg:grid-cols-2",
        )}
      >
        {currentGames.map((jogatina) => (
          <CurrentGameCard
            key={jogatina.id}
            jogatina={jogatina}
            isInteractive={isInteractive}
            onFinish={isInteractive ? handleFinishClick : undefined}
          />
        ))}
      </div>

      {isInteractive && selectedJogatinaId && (
        <FinishCurrentGameDialog
          jogatinaId={selectedJogatinaId}
          gameTitle={selectedGameTitle}
          open={finishDialogOpen}
          onOpenChange={setFinishDialogOpen}
        />
      )}
    </>
  )
}
