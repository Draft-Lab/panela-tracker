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
import { cn } from "@/lib/utils"

interface CurrentGameCardProps {
  jogatina: Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
    jogatina_events?: Pick<JogatinaEvent, "player_id" | "event_type" | "timestamp">[]
  }
  isInteractive?: boolean
  onFinish?: (jogatinaId: string, gameTitle: string) => void
  /** Cards lado a lado precisam de layout empilhado para não esmagar capa e participantes */
  compact?: boolean
}

export function CurrentGameCard({
  jogatina,
  isInteractive = false,
  onFinish,
  compact = false,
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
      className="h-full"
      contentClassName="flex h-full flex-col p-4 md:p-5"
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4",
          !compact &&
            "@min-[640px]:flex-row @min-[640px]:items-stretch @min-[640px]:justify-between @min-[640px]:gap-5",
        )}
      >
        <div className="flex min-w-0 flex-1 gap-3 md:gap-4">
          <LandingCoverThumb
            src={coverUrl}
            alt={jogatina.game.title}
            size={compact ? "md" : "lg"}
            imageSizes={compact ? "52px" : "76px"}
          />

          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground md:text-lg">
                {jogatina.game.title}
              </h3>
              <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground ring-1 ring-white/[0.08]">
                {sessionType}
              </span>
            </div>

            <GameIgdbMetaInline
              game={jogatina.game}
              variant={compact ? "line" : "chips"}
              className="opacity-90"
            />

            <LiveSessionMeta startedAt={sessionStartedAt} />

            {isInteractive && onFinish && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-white/10 bg-background/40 text-xs active:scale-[0.98]"
                onClick={() => onFinish(jogatina.id, jogatina.game.title)}
              >
                <X className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
                Finalizar
              </Button>
            )}
          </div>
        </div>

        {hasParticipants && (
          <div
            className={cn(
              "shrink-0 border-t border-white/[0.06] pt-3",
              !compact &&
                "@min-[640px]:flex @min-[640px]:w-auto @min-[640px]:max-w-[42%] @min-[640px]:flex-col @min-[640px]:justify-center @min-[640px]:border-l @min-[640px]:border-t-0 @min-[640px]:pl-5 @min-[640px]:pt-0",
            )}
          >
            <div
              className={cn(
                "space-y-2",
                compact && "flex flex-col gap-2 space-y-0",
              )}
            >
              <LandingLiveIndicator />
              <CurrentSessionParticipants
                jogatinaPlayers={jogatina.jogatina_players ?? []}
                events={sessionEvents}
              />
            </div>
          </div>
        )}
      </div>
    </LandingGlassMediaCard>
  )
}
