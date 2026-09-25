"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Clock3 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardFolder } from "@/components/motion/card-folder"
import { DigitSwap } from "@/components/motion/digit-swap"
import type { PlayerAchievement } from "@/lib/player-achievements"
import { formatPlayerDuration } from "@/lib/player-profile-helpers"
import type { Player } from "@/lib/types"

interface LandingPlayerProfileCardProps {
  player: Player
  position: number
  totalSessions: number
  totalMinutes: number
  dropCount: number
  uniqueGames: number
  dropRate: number
  achievements?: PlayerAchievement[]
}

function FolderStat({
  label,
  value,
  animationKey,
  accent = false,
}: {
  label: string
  value: number
  animationKey: string
  accent?: boolean
}) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-center">
      <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <DigitSwap
        value={value.toLocaleString("pt-BR")}
        animationKey={animationKey}
        className={`font-mono text-lg font-semibold tabular-nums tracking-tight sm:text-xl ${accent ? "text-rose-300" : "text-foreground"}`}
      />
    </span>
  )
}

export function LandingPlayerProfileCard({
  player,
  position,
  totalSessions,
  totalMinutes,
  dropCount,
  uniqueGames,
  dropRate,
  achievements = [],
}: LandingPlayerProfileCardProps) {
  const [open, setOpen] = useState(false)
  const primaryAchievement = achievements[0]
  const duration = formatPlayerDuration(totalMinutes)

  return (
    <article className="group mx-auto w-full max-w-[27rem]">
      <h3 className="sr-only">{player.name}</h3>
      <CardFolder
        title={player.name}
        open={open}
        onOpenChange={setOpen}
        ariaLabel={`${open ? "Fechar" : "Abrir"} ficha de ${player.name}. ${duration} jogadas, ${player.points_balance ?? 0} pontos, ${totalSessions} sessões, ${uniqueGames} jogos e ${dropCount} drops.`}
        className="w-full"
        frontShape="flat"
        cardClassName="border-white/[0.14] bg-[radial-gradient(circle_at_12%_0%,rgba(39,93,245,0.17),transparent_55%)] bg-card"
        frontClassName="[&_svg_path:first-child]:fill-card"
        card={
          <div className="flex h-full flex-col p-3 sm:p-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-10 shrink-0 ring-1 ring-white/20 sm:size-11">
                <AvatarImage src={player.avatar_url || ""} alt="" />
                <AvatarFallback className="text-xs font-semibold">
                  {player.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {player.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {primaryAchievement?.label ?? "Membro da Panela"}
                </span>
              </span>
              <span className="self-start font-mono text-[11px] tabular-nums text-primary/80">
                {String(position).padStart(2, "0")}
              </span>
            </div>

            <div className="mt-1.5 min-w-0 sm:mt-2">
              <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.13em] text-muted-foreground">
                <Clock3 className="size-3 text-primary" aria-hidden="true" />
                Tempo no grupo
              </span>
              <span className="mt-0.5 block truncate text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-lg">
                {duration}
              </span>
            </div>

            <div className="mt-auto flex min-w-0 items-end justify-between gap-2 border-t border-white/[0.08] pt-2">
              <span className="truncate text-[10px] text-muted-foreground">
                {achievements.slice(1).map((achievement) => achievement.label).join(" · ") || "Da nossa panela"}
              </span>
              <span className="shrink-0 text-right text-[10px] text-muted-foreground">
                {dropCount === 0 ? "Sem drops" : `${Math.round(dropRate)}% de drops`}
              </span>
            </div>
          </div>
        }
        front={
          <span className="grid h-full grid-cols-4 items-center divide-x divide-white/[0.08] px-1.5">
            <FolderStat label="Sessões" value={totalSessions} animationKey={`${player.id}-${open}`} />
            <FolderStat label="Jogos" value={uniqueGames} animationKey={`${player.id}-${open}`} />
            <FolderStat label="Pontos" value={player.points_balance ?? 0} animationKey={`${player.id}-${open}`} />
            <FolderStat label="Drops" value={dropCount} animationKey={`${player.id}-${open}`} accent={dropCount > 0} />
          </span>
        }
      />
      <Link
        href={`/jogadores/${player.id}`}
        className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Ver perfil de {player.name}
        <ArrowUpRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </Link>
    </article>
  )
}
