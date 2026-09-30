"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export function LandingPlayerProfileCard({ player, position, totalSessions, totalMinutes, dropCount, uniqueGames, dropRate, achievements = [] }: LandingPlayerProfileCardProps) {
  const [open, setOpen] = useState(false)
  const duration = formatPlayerDuration(totalMinutes)
  return (
    <article className="homepage-player-card">
      <span className="homepage-player-stamp">Carteirinha da panela</span>
      <div className="homepage-player-identity">
        <Avatar className="homepage-player-avatar">
          <AvatarImage src={player.avatar_url || ""} alt="" />
          <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="homepage-player-position">{String(position).padStart(2, "0")}</span>
        <h3>{player.name}</h3>
        <p className="homepage-player-badge">{achievements[0]?.label ?? "Membro da Panela"}</p>
      </div>
      <div className="homepage-player-time"><strong>{duration}</strong><span>Tempo no grupo</span></div>
      <dl className="homepage-player-stats">
        <div><dt>Sessões</dt><dd>{totalSessions.toLocaleString("pt-BR")}</dd></div>
        <div><dt>Jogos</dt><dd>{uniqueGames.toLocaleString("pt-BR")}</dd></div>
        <div><dt>Pontos</dt><dd>{(player.points_balance ?? 0).toLocaleString("pt-BR")}</dd></div>
        <div><dt>Drops</dt><dd>{dropCount}</dd></div>
      </dl>
      <button type="button" className="homepage-player-toggle" aria-expanded={open} aria-controls={`player-detail-${player.id}`}
        aria-label={`Ficha do jogador ${player.name}, ${open ? "fechar" : "abrir"}`} onClick={() => setOpen(!open)}>
        Ficha do jogador <ChevronDown size={16} className={open ? "rotate-180" : ""} />
      </button>
      {open && <div id={`player-detail-${player.id}`} className="homepage-player-detail">
        <p>{dropCount === 0 ? "Sem drops" : `${Math.round(dropRate)}% de drops`}</p>
        <p>{achievements.slice(1).map(item => item.label).join(" · ") || "Da nossa panela"}</p>
      </div>}
      <Link className="homepage-player-link" href={`/jogadores/${player.id}`}>Ver perfil de {player.name} <ArrowUpRight size={17} /></Link>
    </article>
  )
}
