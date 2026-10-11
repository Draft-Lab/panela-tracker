import Image from "next/image"
import { Gamepad2, X } from "lucide-react"
import type { CurrentGameCardProps } from "@/components/landing/current-game-card"
import { CurrentSessionParticipants } from "@/components/landing/current-session-participants"
import { LiveSessionMeta } from "@/components/landing/live-session-meta"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"
import { getLiveSessionStartedAt } from "@/lib/live-session-helpers"
import { cn } from "@/lib/utils"

export function HomepageLobbyCard({ jogatina, compact, isInteractive, onFinish }: CurrentGameCardProps) {
  const cover = jogatina.game.cover_url
  const artwork = jogatina.game.screenshots?.[0] || cover
  return (
    <article className={cn("homepage-lobby", compact && "homepage-lobby-compact")}>
      <div className="homepage-lobby-scene">
        {artwork ? <Image src={artwork} alt={`Cenário de ${jogatina.game.title}`} fill sizes="(max-width: 767px) 100vw, 650px" className="homepage-lobby-art" /> : <Gamepad2 size={64} className="homepage-lobby-placeholder" aria-hidden="true" />}
        <span className="homepage-lobby-tag"><span aria-hidden="true" />Em partida</span>
      </div>
      <div className="homepage-lobby-ticket">
        <div className="homepage-lobby-ticket-heading">
          <h3>{jogatina.game.title}</h3>
          <span className="homepage-lobby-mode">{jogatina.session_type === "solo" ? "Solo" : "Em grupo"}</span>
        </div>
        <GameIgdbMetaInline game={jogatina.game} variant="line" className="homepage-lobby-genres" />
        <div className="homepage-lobby-clock"><LiveSessionMeta startedAt={getLiveSessionStartedAt(jogatina)} /></div>
        {isInteractive && onFinish && <button type="button" className="homepage-lobby-finish" onClick={() => onFinish(jogatina.id, jogatina.game.title)}><X size={14} />Finalizar sessão</button>}
      </div>
      <div className="homepage-lobby-roster">
        <p>Quem está na partida</p>
        {(jogatina.jogatina_players?.length ?? 0) > 0 ? <CurrentSessionParticipants jogatinaPlayers={jogatina.jogatina_players ?? []} events={jogatina.jogatina_events ?? []} /> : <span className="homepage-lobby-no-players">Participantes ainda não registrados.</span>}
      </div>
    </article>
  )
}
