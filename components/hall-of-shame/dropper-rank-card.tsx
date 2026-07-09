import Link from "next/link"
import { ArrowUpRight, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  type DropperStat,
  formatDropGap,
  formatDropRate,
} from "@/components/hall-of-shame/dropper-rank-utils"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"

interface DropperRankCardProps {
  stat: DropperStat
  rank: 1 | 2 | 3
  variant: "champion" | "row"
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
  const avatarUrl = stat.avatarUrl || ""
  const isChampion = variant === "champion"

  if (isChampion) {
    return (
      <Link
        href={`/jogadores/${stat.playerId}`}
        className={cn("group block", className)}
      >
        <LandingGlassCell
          innerClassName="relative overflow-hidden p-0"
          className="h-full"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(239,68,68,0.14),transparent_55%)]" />
          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <Avatar className="h-16 w-16 shrink-0 ring-2 ring-destructive/30 transition-transform duration-300 group-hover:scale-[1.03] sm:h-20 sm:w-20">
                <AvatarImage src={avatarUrl} alt={stat.playerName} />
                <AvatarFallback className="text-sm font-semibold">
                  {stat.playerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-destructive/90">
                  Campeão do drop
                </p>
                <h3 className="truncate text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  {stat.playerName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <TrendingDown
                      className="h-3.5 w-3.5 shrink-0 text-destructive/70"
                      strokeWidth={1.75}
                    />
                    {formatDropRate(stat)}
                  </span>
                  <span className="tabular-nums">
                    {stat.totalJogatinas} jogatinas
                  </span>
                </div>
                {runnerUp && (
                  <p className="pt-0.5 text-xs text-muted-foreground">
                    {formatDropGap(stat, runnerUp)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-end justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
              <div className="text-left sm:text-right">
                <p className="text-5xl font-semibold tabular-nums tracking-tight text-destructive sm:text-6xl">
                  {stat.dropos}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">drops</p>
              </div>
              <ArrowUpRight
                className="mb-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:opacity-100 sm:mb-0"
                strokeWidth={1.75}
              />
            </div>
          </div>
        </LandingGlassCell>
      </Link>
    )
  }

  return (
    <Link
      href={`/jogadores/${stat.playerId}`}
      className={cn(
        "group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] sm:gap-4 sm:px-5",
        className,
      )}
    >
      <span className="w-6 shrink-0 text-center text-sm font-medium tabular-nums text-muted-foreground">
        #{rank}
      </span>

      <Avatar className="h-11 w-11 shrink-0 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-[1.03] sm:h-12 sm:w-12">
        <AvatarImage src={avatarUrl} alt={stat.playerName} />
        <AvatarFallback className="text-xs font-semibold">
          {stat.playerName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-base">
          {stat.playerName}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingDown
            className="h-3 w-3 shrink-0 text-destructive/70"
            strokeWidth={1.75}
          />
          <span className="tabular-nums">{formatDropRate(stat)}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="tabular-nums">{stat.totalJogatinas} jogatinas</span>
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
          {stat.dropos}
        </p>
        <p className="text-[11px] text-muted-foreground">drops</p>
      </div>
    </Link>
  )
}
