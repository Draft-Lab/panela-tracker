import Image from "next/image"
import { ArrowRight, Clock3, Gamepad2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LocalTime } from "@/components/local-time"
import type { TimelineEvent } from "@/components/landing/timeline-event-item"
import { formatDuration } from "@/lib/calendar-helpers"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"

export function HomepageEventFeedItem({ event }: { event: TimelineEvent }) {
  const { jogatina, firstPlayer, players, playerCount } = event
  const player = players[0]?.player
  const duration = jogatina.total_duration_minutes
  return (
    <article className={`homepage-event-strip${jogatina.is_current ? " homepage-event-live" : ""}`}>
      <div className="homepage-event-player">
        <Avatar><AvatarImage src={player?.avatar_url ?? undefined} alt="" /><AvatarFallback>{firstPlayer.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div><strong>{firstPlayer}</strong><span>{jogatina.session_type === "solo" ? "Sessão solo" : "Sessão em grupo"}</span></div>
      </div>
      <div className="homepage-event-action"><Gamepad2 size={18} aria-hidden="true" /><span>iniciou</span><ArrowRight size={14} aria-hidden="true" /></div>
      <div className="homepage-event-game">
        <div className="homepage-event-game-info"><strong>{jogatina.game.title}</strong><GameIgdbMetaInline game={jogatina.game} className="homepage-event-game-details" /></div>
        <span className="homepage-event-cover">{jogatina.game.cover_url ? <Image src={jogatina.game.cover_url} alt="" fill sizes="40px" className="object-cover" /> : <Gamepad2 size={22} aria-hidden="true" />}</span>
      </div>
      <div className="homepage-event-meta">
        <span><Users size={12} aria-hidden="true" />{playerCount} {playerCount === 1 ? "jogador" : "jogadores"}</span>
        {duration != null && duration > 0 ? <span><Clock3 size={12} aria-hidden="true" />{formatDuration(duration)}</span> : null}
        <span className={`homepage-event-status${jogatina.is_current ? " is-live" : ""}`}>{jogatina.is_current ? "● Ao vivo" : "Encerrada"}</span>
        <LocalTime iso={jogatina.date} />
      </div>
      {players.length > 0 && (
        <ul className="homepage-event-roster" aria-label="Participantes da sessão">
          {players.map(({ player: participant }) => (
            <li key={participant.id}>
              <Avatar><AvatarImage src={participant.avatar_url ?? undefined} alt="" /><AvatarFallback>{participant.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <span>{participant.name}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
