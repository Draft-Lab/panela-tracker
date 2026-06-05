"use client"

import { useMemo } from "react"
import { Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { calculatePlayerStats } from "@/lib/status-helpers"
import { cn } from "@/lib/utils"
import type { JogatinaPlayer, SeasonParticipant, Player } from "@/lib/types"

interface HallOfShameProps {
  jogatinaPlayers: (JogatinaPlayer & { player?: Player })[]
  seasonParticipants?: (SeasonParticipant & { player?: Player })[]
}

type DropperStat = ReturnType<typeof calculatePlayerStats>[number]

const RANK_STYLES = {
  1: {
    label: "text-red-400",
    stat: "text-red-500",
    avatarRing: "ring-red-500/40",
    avatarBorder: "border-red-500/50",
    avatarFallback: "bg-red-950 text-red-100",
    pedestal:
      "border-red-600/40 border-t-red-500 bg-gradient-to-t from-red-950 via-red-800 to-red-600",
    pedestalHeight: "h-24 sm:h-28 md:h-36",
    rankMark: "text-red-100/15",
  },
  2: {
    label: "text-muted-foreground",
    stat: "text-foreground",
    avatarRing: "ring-border/80",
    avatarBorder: "border-border",
    avatarFallback: "bg-muted text-muted-foreground",
    pedestal:
      "border-border/60 border-t-zinc-500 bg-gradient-to-t from-zinc-950 via-zinc-800 to-zinc-600",
    pedestalHeight: "h-16 sm:h-20 md:h-28",
    rankMark: "text-zinc-400/12",
  },
  3: {
    label: "text-muted-foreground",
    stat: "text-foreground",
    avatarRing: "ring-border/60",
    avatarBorder: "border-border/80",
    avatarFallback: "bg-muted/80 text-muted-foreground",
    pedestal:
      "border-border/50 border-t-zinc-600 bg-gradient-to-t from-zinc-950 via-zinc-900 to-zinc-700",
    pedestalHeight: "h-12 sm:h-14 md:h-20",
    rankMark: "text-zinc-500/10",
  },
} as const

interface PodiumSlotProps {
  rank: 1 | 2 | 3
  stat: DropperStat
  className?: string
}

function PodiumSlot({ rank, stat, className }: PodiumSlotProps) {
  const theme = RANK_STYLES[rank]
  const isFirst = rank === 1

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center",
        isFirst && "z-10 md:-mt-2",
        className,
      )}
    >
      <div className="flex w-full flex-col items-center px-2 pb-4 text-center sm:px-3 md:px-4">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-widest sm:text-xs",
            theme.label,
          )}
        >
          {rank}º lugar
        </span>

        <Avatar
          className={cn(
            "mt-3 ring-2",
            theme.avatarRing,
            theme.avatarBorder,
            isFirst
              ? "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 md:h-24 md:w-24"
              : "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]",
          )}
        >
          <AvatarImage src={stat.avatarUrl || ""} alt={stat.playerName} />
          <AvatarFallback
            className={cn("text-xs font-semibold sm:text-sm", theme.avatarFallback)}
          >
            {stat.playerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <p className="mt-3 line-clamp-1 w-full text-sm font-semibold text-foreground sm:text-base">
          {stat.playerName}
        </p>

        <p
          className={cn(
            "mt-1 font-bold tabular-nums tracking-tight",
            theme.stat,
            isFirst ? "text-3xl sm:text-4xl md:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
          {stat.dropos}
        </p>
        <p className="text-[10px] text-muted-foreground sm:text-xs">drops</p>
        <p className="mt-2 text-[11px] text-muted-foreground sm:text-sm">
          {stat.dropoPercentage.toFixed(0)}% de taxa
        </p>
      </div>

      <div
        className={cn(
          "relative flex w-full items-end justify-center overflow-hidden rounded-t-lg border-x border-t",
          theme.pedestal,
          theme.pedestalHeight,
        )}
      >
        <span
          className={cn(
            "select-none pb-2 text-5xl font-black tabular-nums md:text-6xl",
            theme.rankMark,
          )}
        >
          {rank}
        </span>
      </div>
    </div>
  )
}

function PodiumStage({
  first,
  second,
  third,
  className,
}: {
  first: DropperStat
  second?: DropperStat
  third?: DropperStat
  className?: string
}) {
  const count = 1 + (second ? 1 : 0) + (third ? 1 : 0)

  return (
    <div className={cn("px-4 sm:px-6", className)}>
      <div
        className={cn(
          "mx-auto flex max-w-3xl items-end justify-center gap-2 sm:gap-3 md:gap-4",
          count === 1 && "max-w-[220px]",
          count === 2 && "max-w-xl",
        )}
      >
        {second && (
          <PodiumSlot
            rank={2}
            stat={second}
            className={count === 2 ? "order-1" : undefined}
          />
        )}
        <PodiumSlot
          rank={1}
          stat={first}
          className={cn(count === 2 && "order-2", count === 1 && "max-w-[220px]")}
        />
        {third && <PodiumSlot rank={3} stat={third} />}
      </div>

      <div className="mx-auto mt-0 h-1 max-w-3xl rounded-full bg-border/80" />
    </div>
  )
}

export function HallOfShame({ jogatinaPlayers, seasonParticipants = [] }: HallOfShameProps) {
  const topDroppers = useMemo(() => {
    const allStats = calculatePlayerStats(jogatinaPlayers, seasonParticipants)

    return allStats
      .filter((p) => p.totalJogatinas > 0)
      .sort((a, b) => b.dropos - a.dropos)
      .slice(0, 3)
  }, [jogatinaPlayers, seasonParticipants])

  if (topDroppers.length === 0) {
    return null
  }

  const first = topDroppers[0]
  const second = topDroppers[1]
  const third = topDroppers[2]

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4 sm:px-6">
        <Flame className="h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
        <p className="text-sm font-medium text-foreground">Ranking de drops</p>
      </div>

      <PodiumStage
        first={first}
        second={second}
        third={third}
        className="pb-5 pt-6 md:pb-6 md:pt-8"
      />
    </div>
  )
}
