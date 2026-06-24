import { X } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer, Player, JogatinaEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LandingCoverThumb, LandingLiveIndicator } from "@/components/landing/landing-glass-cell"
import { LandingGlassMediaCard } from "@/components/landing/landing-glass-media-card"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"
import { LiveSessionMeta } from "@/components/landing/live-session-meta"
import { CurrentSessionParticipants } from "@/components/landing/current-session-participants"
import { getLiveSessionStartedAt } from "@/lib/live-session-helpers"
import { buildCurrentSessionParticipants } from "@/lib/current-session-player-helpers"

interface CurrentGameCardProps {
  jogatina: Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
    jogatina_events?: Pick<JogatinaEvent, "player_id" | "event_type" | "timestamp">[]
  }
  isInteractive?: boolean
  onFinish?: (jogatinaId: string, gameTitle: string) => void
}

export function CurrentGameCard({
  jogatina,
  isInteractive = false,
  onFinish,
}: CurrentGameCardProps) {
  const sessionEvents = jogatina.jogatina_events ?? []
  const activeCount = buildCurrentSessionParticipants(
    jogatina.jogatina_players ?? [],
    sessionEvents,
  ).active.length
  const sessionType = activeCount > 1 ? "Grupo" : "Solo"
  const coverUrl = jogatina.game.cover_url
  const sessionStartedAt = getLiveSessionStartedAt(jogatina)
  const hasParticipants = (jogatina.jogatina_players?.length ?? 0) > 0

  return (
    <LandingGlassMediaCard
      coverSrc={coverUrl}
      coverAlt={jogatina.game.title}
      contentClassName="p-4 md:p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <LandingCoverThumb
            src={coverUrl}
            alt={jogatina.game.title}
            size="lg"
            imageSizes="80px"
          />

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl">
                  {jogatina.game.title}
                </h3>
                <span className="text-xs text-muted-foreground">{sessionType}</span>
              </div>

              <GameIgdbMetaInline
                game={jogatina.game}
                variant="chips"
                className="mt-2 opacity-90"
              />
            </div>

            <LiveSessionMeta startedAt={sessionStartedAt} />

            {isInteractive && onFinish && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-border/80 bg-background/40 text-xs active:scale-[0.98]"
                onClick={() => onFinish(jogatina.id, jogatina.game.title)}
              >
                <X className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
                Finalizar
              </Button>
            )}
          </div>
        </div>

        {hasParticipants && (
          <div className="flex flex-col justify-center gap-3 border-t border-white/[0.06] pt-4 lg:min-w-[14rem] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <LandingLiveIndicator />
            <CurrentSessionParticipants
              jogatinaPlayers={jogatina.jogatina_players ?? []}
              events={sessionEvents}
            />
          </div>
        )}
      </div>
    </LandingGlassMediaCard>
  )
}
