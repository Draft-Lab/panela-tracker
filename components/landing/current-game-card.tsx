import { Badge } from "@/components/ui/badge"
import { Gamepad2, X } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer, Player, JogatinaEvent } from "@/lib/types"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  const sessionType =
    buildCurrentSessionParticipants(jogatina.jogatina_players ?? [], sessionEvents)
      .active.length > 1
      ? "Grupo"
      : "Solo"
  const coverUrl = jogatina.game.cover_url
  const sessionStartedAt = getLiveSessionStartedAt(jogatina)

  return (
    <article className="relative overflow-hidden rounded-xl border border-border/50">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center blur-lg brightness-[0.5] saturate-110"
            />
            <div className="absolute inset-0 bg-background/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-background/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-card/30 to-background" />
        )}
      </div>

      <div className="absolute right-3 top-3 z-20 flex items-center gap-1">
        <Badge
          variant="outline"
          className="h-5 border-green-500/35 bg-green-500/10 px-1.5 text-[10px] text-green-400 backdrop-blur-sm"
        >
          Jogando
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "h-5 px-1.5 text-[10px] backdrop-blur-sm",
            sessionType === "Solo"
              ? "border-blue-500/35 bg-blue-500/10 text-blue-400"
              : "border-purple-500/35 bg-purple-500/10 text-purple-400",
          )}
        >
          {sessionType}
        </Badge>
      </div>

      <div className="relative z-10 flex gap-3 p-4 pr-28">
        <div
          className={cn(
            "relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1",
            coverUrl ? "ring-white/10" : "ring-border/60",
          )}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={jogatina.game.title}
              fill
              sizes="48px"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/80">
              <Gamepad2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {jogatina.game.title}
            </p>

            <GameIgdbMetaInline
              game={jogatina.game}
              variant="chips"
              className="opacity-90"
            />

            <LiveSessionMeta startedAt={sessionStartedAt} />
          </div>

          {(jogatina.jogatina_players?.length ?? 0) > 0 && (
            <CurrentSessionParticipants
              jogatinaPlayers={jogatina.jogatina_players ?? []}
              events={sessionEvents}
            />
          )}

          {isInteractive && onFinish && (
            <Button
              size="sm"
              variant="destructive"
              className="h-7 backdrop-blur-sm"
              onClick={() => onFinish(jogatina.id, jogatina.game.title)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
