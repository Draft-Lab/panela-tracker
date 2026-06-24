import Link from "next/link"
import { ArrowUpRight, Calendar, Clock, Gamepad2, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlayerProfileStat } from "@/components/landing-player-profiles/player-profile-stat"
import type { PlayerAchievement } from "@/lib/player-achievements"
import { formatPlayerDuration } from "@/lib/player-profile-helpers"
import { cn } from "@/lib/utils"
import type { Player } from "@/lib/types"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"

interface LandingPlayerProfileCardProps {
  player: Player
  totalSessions: number
  totalMinutes: number
  dropCount: number
  uniqueGames: number
  dropRate: number
  achievements?: PlayerAchievement[]
}

function AchievementPill({
  achievement,
  className,
}: {
  achievement: PlayerAchievement
  className?: string
}) {
  return (
    <span
      title={achievement.description}
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        achievement.style,
        className,
      )}
    >
      {achievement.label}
    </span>
  )
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
  const initials = player.name.slice(0, 2).toUpperCase()
  const avatarUrl = player.avatar_url || ""
  const primaryAchievement = achievements[0]
  const secondaryAchievements = achievements.slice(1)

  return (
    <Link href={`/jogadores/${player.id}`} className="group block h-full">
      <LandingGlassCell
        className="h-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]"
        innerClassName="flex h-full flex-col gap-4 p-4 sm:p-5"
      >
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              className="absolute -inset-1 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <Avatar className="relative h-14 w-14 ring-2 ring-white/15 transition-transform duration-300 group-hover:scale-[1.03] sm:h-16 sm:w-16">
              <AvatarImage src={avatarUrl} alt={player.name} />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:text-lg">
                {player.name}
              </h3>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:opacity-100"
                strokeWidth={1.75}
              />
            </div>

            {primaryAchievement ? (
              <div className="mt-2">
                <AchievementPill achievement={primaryAchievement} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tempo no grupo
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-primary/80" strokeWidth={1.75} />
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatPlayerDuration(totalMinutes)}
            </p>
          </div>
        </div>

        <div className="rounded-[1.25rem] bg-white/[0.03] p-1 ring-1 ring-white/[0.06]">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[calc(1.25rem-0.25rem)] bg-white/[0.04]">
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

        {secondaryAchievements.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {secondaryAchievements.map((achievement) => (
              <AchievementPill key={achievement.id} achievement={achievement} />
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-1">
          <span
            className={cn(
              "flex w-full items-center justify-between rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-muted-foreground",
              "transition-[background-color,color,border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "group-hover:border-white/[0.12] group-hover:bg-white/[0.05] group-hover:text-foreground",
            )}
          >
            Ver perfil
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06]",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                "group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:bg-white/[0.1]",
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </span>
        </div>
      </LandingGlassCell>
    </Link>
  )
}
