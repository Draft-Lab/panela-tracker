import { Users } from "lucide-react"
import Image from "next/image"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import { LocalTime } from "@/components/local-time"
import { cn } from "@/lib/utils"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"
import { LandingTimelineCard } from "@/components/landing/landing-glass-media-card"

export interface TimelineEvent {
  jogatina: Jogatina & { game: Game }
  firstPlayer: string
  playerCount: number
  players: (JogatinaPlayer & { player: Player })[]
}

interface TimelineEventItemProps {
  event: TimelineEvent
  isFirst: boolean
  isLast: boolean
  compact?: boolean
}

function formatDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return null
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function TimelineEventItem({
  event,
  isFirst,
  isLast,
}: TimelineEventItemProps) {
  const { jogatina, firstPlayer, playerCount, players } = event
  const coverUrl = jogatina.game.cover_url
  const sessionType = jogatina.session_type === "solo" ? "Solo" : "Grupo"
  const duration = formatDuration(jogatina.total_duration_minutes)
  const visiblePlayers = players.slice(0, 3)
  const isLive = Boolean(jogatina.is_current)

  return (
    <div
      className={cn(
        "grid grid-cols-[0.875rem_minmax(0,1fr)] gap-x-3",
        !isLast && "pb-2",
      )}
    >
      <div className="relative flex flex-col items-center">
        {!isFirst && <div className="w-px flex-1 bg-white/10" aria-hidden />}

        <div
          className={cn(
            "relative z-10 my-0.5 size-2 shrink-0 rounded-full border-2 border-background",
            isLive
              ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"
              : "bg-primary shadow-[0_0_0_2px_rgba(99,102,241,0.12)]",
          )}
          aria-hidden
        />

        {!isLast && <div className="w-px flex-1 bg-white/10" aria-hidden />}
      </div>

      <LandingTimelineCard
        coverSrc={coverUrl}
        coverAlt={jogatina.game.title}
        isLive={isLive}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold tracking-tight text-foreground">
            {jogatina.game.title}
          </p>
          <LocalTime
            iso={jogatina.date}
            className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
          />
        </div>

        <GameIgdbMetaInline
          game={jogatina.game}
          variant="line"
          className="mt-0.5"
        />

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/85">{firstPlayer}</span>
          {" "}iniciou · {sessionType}
          {duration ? ` · ${duration}` : ""}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Users className="h-2.5 w-2.5" strokeWidth={1.75} />
            {playerCount}
          </span>

          {visiblePlayers.length > 0 && (
            <div className="flex -space-x-1.5">
              {visiblePlayers.map((jp) => (
                <div
                  key={jp.player.id}
                  className="relative h-5 w-5 overflow-hidden rounded-full border border-background"
                >
                  {jp.player.avatar_url ? (
                    <Image
                      src={jp.player.avatar_url}
                      alt={jp.player.name}
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-[7px] font-medium">
                      {jp.player.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isLive && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">
              Ao vivo
            </span>
          )}
        </div>
      </LandingTimelineCard>
    </div>
  )
}
