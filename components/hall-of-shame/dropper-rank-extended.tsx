"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type DropperStat,
  formatDropRate,
} from "@/components/hall-of-shame/dropper-rank-utils"

interface DropperRankExtendedProps {
  droppers: DropperStat[]
  startRank?: number
}

function DropperRankingRow({
  stat,
  rank,
}: {
  stat: DropperStat
  rank: number
}) {
  return (
    <Link
      href={`/jogadores/${stat.playerId}`}
      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 sm:gap-4 sm:px-5"
    >
      <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground sm:w-6 sm:text-sm">
        {rank}
      </span>

      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/50 sm:h-11 sm:w-11">
        <AvatarImage src={stat.avatarUrl || undefined} alt={stat.playerName} />
        <AvatarFallback className="text-xs">
          {stat.playerName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
          {stat.playerName}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingDown className="h-3 w-3 shrink-0 text-destructive/70" strokeWidth={2} />
          <span className="tabular-nums">{formatDropRate(stat)}</span>
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-semibold tabular-nums tracking-tight sm:text-lg">
          {stat.dropos}
        </p>
        <p className="text-[11px] text-muted-foreground">drops</p>
      </div>
    </Link>
  )
}

export function DropperRankExtended({
  droppers,
  startRank = 4,
}: DropperRankExtendedProps) {
  const [expanded, setExpanded] = useState(false)

  if (droppers.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Recolher
              <ChevronUp className="size-3.5" strokeWidth={2.5} />
            </>
          ) : (
            <>
              Ver ranking completo
              <span className="text-muted-foreground/80">
                · {droppers.length}{" "}
                {droppers.length === 1 ? "jogador" : "jogadores"}
              </span>
              <ChevronDown className="size-3.5" strokeWidth={2.5} />
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-border/40 rounded-xl border border-border/50 bg-card/20">
            {droppers.map((stat, index) => (
              <DropperRankingRow
                key={stat.playerId}
                stat={stat}
                rank={startRank + index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
