"use client"

import type { Jogatina, Game, JogatinaPlayer, Player, JogatinaEvent } from "@/lib/types"
import { useState } from "react"
import { FinishCurrentGameDialog } from "@/components/finish-current-game-dialog"
import { CurrentGameCard } from "@/components/landing/current-game-card"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import { LiveSessionEventToasts } from "@/components/landing/live-session-event-toasts"
import { useLiveCurrentJogatinas } from "@/hooks/use-live-current-jogatinas"
import type { LandingCurrentJogatina } from "@/lib/fetch-current-jogatinas"
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
  currentGames: initialGames,
  isInteractive = false,
  appearance = "default",
}: LandingCurrentGamesSectionProps) {
  const { currentGames, liveEvents } = useLiveCurrentJogatinas(
    initialGames as LandingCurrentJogatina[],
  )
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [selectedJogatinaId, setSelectedJogatinaId] = useState<string | null>(null)
  const [selectedGameTitle, setSelectedGameTitle] = useState<string>("")
  const handleFinishClick = (jogatinaId: string, gameTitle: string) => {
    setSelectedJogatinaId(jogatinaId)
    setSelectedGameTitle(gameTitle)
    setFinishDialogOpen(true)
  }

  return (
    <>
      <LiveSessionEventToasts events={liveEvents} appearance={appearance} />

      {currentGames.length === 0 ? (
        appearance === "cartoon" ? (
          <div className="homepage-lobby-empty">
            <div>
              <span className="homepage-lobby-tag">Intervalo no lobby</span>
              <h3>A panela já volta.</h3>
              <p>
                Ninguém está jogando agora. A próxima partida merece uma história.
              </p>
            </div>
          </div>
        ) : (
          <LandingEmptyState>Ninguém está jogando agora</LandingEmptyState>
        )
      ) : (
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
      )}

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
