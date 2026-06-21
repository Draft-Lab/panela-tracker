import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Calendar, Clock, Gamepad2, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlayerProfileStat } from "@/components/landing-player-profiles/player-profile-stat"
import type { PlayerAchievement } from "@/lib/player-achievements"
import {
  getPlayerCardAccentIndex,
  PLAYER_CARD_ACCENTS,
} from "@/lib/player-card-accent"
import { formatPlayerDuration } from "@/lib/player-profile-helpers"
import { cn } from "@/lib/utils"
import type { Player } from "@/lib/types"

interface LandingPlayerProfileCardProps {
  player: Player
  totalSessions: number
  totalMinutes: number
  dropCount: number
  uniqueGames: number
  dropRate: number
  achievements?: PlayerAchievement[]
}

export function LandingPlayerProfileCard({
  player,
  totalSessions,
  totalMinutes,
  dropCount,
  uniqueGames,
  dropRate,
  achievements = [],
}: LandingPlayerProfileCardProps) {
  const accent = PLAYER_CARD_ACCENTS[getPlayerCardAccentIndex(player.id)]
  const initials = player.name.slice(0, 2).toUpperCase()
  const avatarUrl = player.avatar_url || ""
  const primaryAchievement = achievements[0]

  return (
    <Link
      href={`/jogadores/${player.id}`}
      className={cn(
        "group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        accent.hoverBorder,
      )}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {avatarUrl ? (
          <>
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 blur-md brightness-[0.38] saturate-125"
            />
            <div className="absolute inset-0 bg-background/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/50" />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              accent.surface,
            )}
          />
        )}
      </div>

      <article className="relative z-10 flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Avatar
            className={cn(
              "h-16 w-16 shrink-0 ring-2 transition-transform duration-300 group-hover:scale-[1.03] sm:h-[4.5rem] sm:w-[4.5rem]",
              accent.ring,
            )}
          >
            <AvatarImage src={avatarUrl} alt={player.name} />
            <AvatarFallback className={cn("text-base font-bold sm:text-lg", accent.fallback)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-foreground group-hover:text-primary">
                {player.name}
              </h3>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                strokeWidth={2}
              />
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatPlayerDuration(totalMinutes)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">tempo total no grupo</p>
          </div>
        </div>

        {primaryAchievement ? (
          <Badge
            variant="outline"
            title={primaryAchievement.description}
            className={cn("mt-4 w-fit text-xs", primaryAchievement.style)}
          >
            {primaryAchievement.label}
          </Badge>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
          <div className="grid grid-cols-3 divide-x divide-border/40">
            <PlayerProfileStat
              label="Sessões"
              value={totalSessions.toLocaleString("pt-BR")}
              icon={Calendar}
            />
            <PlayerProfileStat
              label="Drops"
              value={dropCount.toLocaleString("pt-BR")}
              hint={
                dropCount > 0 && totalSessions > 0
                  ? `${dropRate.toFixed(0)}% das sessões`
                  : dropCount === 0
                    ? "Firme demais"
                    : undefined
              }
              icon={TrendingDown}
              valueClassName={dropCount > 0 ? "text-destructive" : undefined}
            />
            <PlayerProfileStat
              label="Jogos"
              value={uniqueGames.toLocaleString("pt-BR")}
              hint="títulos diferentes"
              icon={Gamepad2}
            />
          </div>
        </div>

        {achievements.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {achievements.slice(1).map((achievement) => (
              <Badge
                key={achievement.id}
                variant="outline"
                title={achievement.description}
                className={cn("text-[11px]", achievement.style)}
              >
                {achievement.label}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            Ver perfil
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
            strokeWidth={2}
          />
        </div>
      </article>
    </Link>
  )
}
