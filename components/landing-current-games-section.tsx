"use client"

import type { Jogatina, Game, JogatinaPlayer, Player, JogatinaEvent } from "@/lib/types"
import { useState } from "react"
import { FinishCurrentGameDialog } from "@/components/finish-current-game-dialog"
import { CurrentGameCard } from "@/components/landing/current-game-card"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import { cn } from "@/lib/utils"

interface LandingCurrentGamesSectionProps {
  currentGames: (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
    jogatina_events?: Pick<JogatinaEvent, "player_id" | "event_type" | "timestamp">[]
  })[]
  isInteractive?: boolean
  appearance?: "default" | "cartoon"
}

export function LandingCurrentGamesSection({
  currentGames,
  isInteractive = false,
  appearance = "default",
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
    if (appearance === "cartoon") return (
      <div className="homepage-lobby-empty">
        <div><span className="homepage-lobby-tag">Intervalo no lobby</span><h3>A panela já volta.</h3><p>Ninguém está jogando agora. A próxima partida merece uma história.</p></div>
      </div>
    )
    return <LandingEmptyState>Ninguém está jogando agora</LandingEmptyState>
  }

  return (
    <>
      <div
        className={cn(
          "grid items-stretch gap-4",
          appearance === "cartoon" && "homepage-lobbies",
          currentGames.length > 1 && "md:grid-cols-2",
        )}
      >
        {currentGames.map((jogatina) => (
          <CurrentGameCard
            key={jogatina.id}
            jogatina={jogatina}
            appearance={appearance}
            compact={currentGames.length > 1}
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
