"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { GameRankingStat } from "@/lib/game-stats-helpers"
import {
  LandingCoverThumb,
  LandingGlassCell,
} from "@/components/landing/landing-glass-cell"

interface LandingTopGamesExtendedProps {
  games: GameRankingStat[]
  startRank?: number
}

function GameRankingRow({
  stat,
  rank,
}: {
  stat: GameRankingStat
  rank: number
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
      <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground sm:w-6">
        {rank}
      </span>

      <LandingCoverThumb
        src={stat.game.cover_url}
        alt={stat.game.title}
        size="sm"
        imageSizes="56px"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {stat.game.title}
        </p>
        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
          {stat.participations} participações
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-semibold tabular-nums tracking-tight sm:text-lg">
          {stat.sessions}
        </p>
        <p className="text-[11px] text-muted-foreground">sessões</p>
      </div>
    </div>
  )
}

export function LandingTopGamesExtended({
  games,
  startRank = 4,
}: LandingTopGamesExtendedProps) {
  const [expanded, setExpanded] = useState(false)

  if (games.length === 0) {
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
                · {games.length} {games.length === 1 ? "jogo" : "jogos"}
              </span>
              <ChevronDown className="size-3.5" strokeWidth={2.5} />
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <LandingGlassCell innerClassName="divide-y divide-white/[0.06] p-0">
            {games.map((stat, index) => (
              <GameRankingRow
                key={stat.game.id}
                stat={stat}
                rank={startRank + index}
              />
            ))}
          </LandingGlassCell>
        </div>
      </div>
    </div>
  )
}
