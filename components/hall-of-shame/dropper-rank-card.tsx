import Link from "next/link"
import { ArrowUpRight, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  type DropperStat,
  formatDropGap,
  formatDropRate,
} from "@/components/hall-of-shame/dropper-rank-utils"
import { LandingGlassMediaCard } from "@/components/landing/landing-glass-media-card"

interface DropperRankCardProps {
  stat: DropperStat
  rank: 1 | 2 | 3
  variant: "hero" | "compact"
  runnerUp?: DropperStat
  className?: string
}

export function DropperRankCard({
  stat,
  rank,
  variant,
  runnerUp,
  className,
}: DropperRankCardProps) {
  const isHero = variant === "hero"
  const avatarUrl = stat.avatarUrl || ""

  return (
    <Link href={`/jogadores/${stat.playerId}`} className={cn("group block h-full", className)}>
      <LandingGlassMediaCard
        coverSrc={avatarUrl || undefined}
        coverAlt={stat.playerName}
        className="h-full"
        contentClassName={isHero ? "flex h-full flex-col gap-5 p-6" : "flex h-full flex-col gap-4 p-5"}
        minHeight={isHero ? "min-h-[220px]" : "min-h-[160px]"}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              rank === 1 ? "text-destructive" : "text-muted-foreground",
            )}
          >
            #{rank}
          </span>

          <Avatar
            className={cn(
              "shrink-0 ring-2 ring-white/15 transition-transform duration-300 group-hover:scale-[1.03]",
              isHero ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12",
            )}
          >
            <AvatarImage src={avatarUrl} alt={stat.playerName} />
            <AvatarFallback className="text-xs font-semibold sm:text-sm">
              {stat.playerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "line-clamp-2 font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary",
                isHero ? "text-xl md:text-2xl" : "text-base",
              )}
            >
              {stat.playerName}
            </h3>
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:opacity-100"
              strokeWidth={1.75}
            />
          </div>

          {isHero && rank === 1 && (
            <p className="text-xs text-destructive/90">Campeão do drop</p>
          )}

          <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
            <div>
              <p
                className={cn(
                  "font-semibold tabular-nums tracking-tight",
                  rank === 1 ? "text-destructive" : "text-foreground",
                  isHero ? "text-4xl md:text-5xl" : "text-2xl",
                )}
              >
                {stat.dropos}
              </p>
              <p className="text-xs text-muted-foreground">drops</p>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 tabular-nums">
                <TrendingDown className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {formatDropRate(stat)}
              </p>
              <p className="tabular-nums">{stat.totalJogatinas} jogatinas</p>
            </div>
          </div>

          {isHero && runnerUp && (
            <p className="text-xs text-muted-foreground">
              {formatDropGap(stat, runnerUp)}
            </p>
          )}
        </div>
      </LandingGlassMediaCard>
    </Link>
  )
}
