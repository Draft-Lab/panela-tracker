import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type DropperStat,
  formatDropGap,
  formatDropRate,
} from "@/components/hall-of-shame/dropper-rank-utils"

const RANK_ACCENTS = {
  1: {
    badge:
      "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
    stat: "text-destructive dark:text-red-400",
    ring: "ring-destructive/35",
    surface: "from-destructive/12 via-card/40 to-background",
    avatarGlow: "shadow-[0_0_24px_-4px] shadow-destructive/25",
  },
  2: {
    badge: "border-zinc-400/25 bg-zinc-400/10 text-zinc-300",
    stat: "text-foreground",
    ring: "ring-zinc-400/30",
    surface: "from-zinc-400/8 via-card/35 to-background",
    avatarGlow: "",
  },
  3: {
    badge: "border-amber-600/30 bg-amber-600/10 text-amber-500/90",
    stat: "text-foreground",
    ring: "ring-amber-600/25",
    surface: "from-amber-700/10 via-card/35 to-background",
    avatarGlow: "",
  },
} as const

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
  const accent = RANK_ACCENTS[rank]
  const avatarUrl = stat.avatarUrl || ""

  return (
    <Link
      href={`/jogadores/${stat.playerId}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-border/50 transition-colors hover:border-border/80",
        isHero ? "min-h-[240px] lg:min-h-full" : "min-h-[148px]",
        className,
      )}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {avatarUrl ? (
          <>
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes={
                isHero
                  ? "(max-width: 1024px) 100vw, 58vw"
                  : "(max-width: 1024px) 100vw, 42vw"
              }
              className={cn(
                "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105",
                isHero
                  ? "blur-md brightness-[0.4] saturate-125"
                  : "blur-sm brightness-[0.32] saturate-110",
              )}
            />
            <div className="absolute inset-0 bg-background/55" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/45",
                !isHero && "from-background/95 via-background/40",
              )}
            />
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

      <article
        className={cn(
          "relative z-10 flex h-full flex-col justify-between",
          isHero ? "p-6 sm:p-8" : "p-5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full border font-bold tabular-nums",
              isHero ? "h-9 min-w-9 px-3 text-sm" : "h-7 min-w-7 px-2 text-xs",
              accent.badge,
            )}
          >
            {rank}
          </span>

          <Avatar
            className={cn(
              "shrink-0 ring-2 transition-transform duration-300 group-hover:scale-[1.03]",
              accent.ring,
              accent.avatarGlow,
              isHero ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12",
            )}
          >
            <AvatarImage src={avatarUrl} alt={stat.playerName} />
            <AvatarFallback className="text-xs font-semibold sm:text-sm">
              {stat.playerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className={cn("mt-auto", isHero ? "pt-8" : "pt-5")}>
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "line-clamp-2 font-semibold tracking-tight text-foreground group-hover:text-primary",
                isHero ? "text-xl sm:text-2xl" : "text-base",
              )}
            >
              {stat.playerName}
            </h3>
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={2}
            />
          </div>

          {isHero && rank === 1 && (
            <Badge
              variant="outline"
              className="mt-2 h-5 border-destructive/25 bg-destructive/5 px-2 text-[10px] text-destructive dark:text-red-400"
            >
              Campeão do drop
            </Badge>
          )}

          <div
            className={cn(
              "flex flex-wrap items-end gap-x-5 gap-y-2",
              isHero ? "mt-3 sm:mt-4" : "mt-2",
            )}
          >
            <div>
              <p
                className={cn(
                  "font-bold tabular-nums tracking-tight",
                  accent.stat,
                  isHero ? "text-4xl sm:text-5xl" : "text-2xl",
                )}
              >
                {stat.dropos}
              </p>
              <p className="text-xs text-muted-foreground">drops</p>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 tabular-nums">
                <TrendingDown className="h-3.5 w-3.5 shrink-0 text-destructive/80" strokeWidth={2} />
                {formatDropRate(stat)}
              </p>
              <p className="tabular-nums">{stat.totalJogatinas} jogatinas</p>
            </div>
          </div>

          {isHero && runnerUp && (
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDropGap(stat, runnerUp)}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
