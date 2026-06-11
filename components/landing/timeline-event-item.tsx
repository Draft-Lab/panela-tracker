import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Gamepad2, Users } from "lucide-react"
import Image from "next/image"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import { LocalTime } from "@/components/local-time"
import { cn } from "@/lib/utils"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"

export interface TimelineEvent {
  jogatina: Jogatina & { game: Game }
  firstPlayer: string
  playerCount: number
  players: (JogatinaPlayer & { player: Player })[]
}

interface TimelineEventItemProps {
  event: TimelineEvent
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
  isLast,
  compact = false,
}: TimelineEventItemProps) {
  const { jogatina, firstPlayer, playerCount, players } = event
  const coverUrl = jogatina.game.cover_url
  const sessionType = jogatina.session_type === "solo" ? "Solo" : "Grupo"
  const duration = formatDuration(jogatina.total_duration_minutes)
  const visiblePlayers = players.slice(0, 4)

  return (
    <div className={cn("relative pl-8", !isLast && (compact ? "pb-4" : "pb-8"))}>
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 bottom-0 w-px bg-border/70"
          aria-hidden
        />
      )}

      <div
        className={cn(
          "absolute left-0 top-5 z-10 h-[10px] w-[10px] rounded-full border-2 border-background",
          jogatina.is_current ? "bg-green-500 ring-4 ring-green-500/20" : "bg-primary ring-4 ring-primary/15",
        )}
        aria-hidden
      />

      <article className="overflow-hidden rounded-xl border border-border/50 bg-card/20 transition-colors hover:border-border hover:bg-card/40">
        <div className="flex gap-4 p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={jogatina.game.title}
                fill
                sizes="56px"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {jogatina.game.title}
                </p>
                <GameIgdbMetaInline
                  game={jogatina.game}
                  variant="line"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/90">{firstPlayer}</span>
                  {" "}iniciou a sessão
                </p>
              </div>
              <LocalTime
                iso={jogatina.date}
                className="shrink-0 text-xs text-muted-foreground"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {jogatina.is_current && (
                <Badge
                  variant="outline"
                  className="border-green-500/40 bg-green-500/10 text-green-400"
                >
                  Ao vivo
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  sessionType === "Solo"
                    ? "border-blue-500/35 bg-blue-500/10 text-blue-400"
                    : "border-purple-500/35 bg-purple-500/10 text-purple-400",
                )}
              >
                {sessionType}
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Users className="h-3 w-3" />
                {playerCount}
              </Badge>
              {duration && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {duration}
                </Badge>
              )}
            </div>

            {visiblePlayers.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {visiblePlayers.map((jp) => (
                    <Avatar
                      key={jp.player.id}
                      className="h-7 w-7 border-2 border-background ring-1 ring-border/40"
                    >
                      {jp.player.avatar_url && (
                        <AvatarImage
                          src={jp.player.avatar_url}
                          alt={jp.player.name}
                        />
                      )}
                      <AvatarFallback className="text-[9px]">
                        {jp.player.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {playerCount > visiblePlayers.length && (
                  <span className="text-xs text-muted-foreground">
                    +{playerCount - visiblePlayers.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
