import { Clock3, Gamepad2, Flag, LogOut, Pause } from "lucide-react"
import type { JogatinaPlayer, SeasonParticipant } from "@/lib/types"
import { buildGroupMetricsData } from "./metrics-data"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"

interface LandingGroupMetricsProps { jogatinaPlayers: JogatinaPlayer[]; seasonParticipants: SeasonParticipant[] }
const STATUS_NOTES = {
  jogatina: { title: "Na jogatina", hint: "Participou da jogatina", icon: Gamepad2 },
  dropo: { title: "Deu /quit", hint: "Abandonou a sessão", icon: LogOut },
  zero: { title: "Missão cumprida", hint: "Completou o jogo", icon: Flag },
  davaJogar: { title: "Ficou pra depois", hint: "Parou, mas dava pra jogar", icon: Pause },
}

export function LandingGroupMetrics({ jogatinaPlayers }: LandingGroupMetricsProps) {
  const { total, avgDuration, dropRate, legendItems } = buildGroupMetricsData(jogatinaPlayers)
  if (!total) return <LandingEmptyState>Ainda não há participações registradas.</LandingEmptyState>
  return <div className="homepage-metrics-board">
    <div className="homepage-metrics-ticket">
      <span className="homepage-paper-label">Raio-X da jogatina</span>
      <Clock3 size={34} strokeWidth={2} aria-hidden="true" />
      <p>Em média, a gente fica…</p>
      <strong>{avgDuration}<small>min</small></strong>
      <span>por participação</span>
      <div className="homepage-metrics-ticket-bottom"><p><b>{total.toLocaleString("pt-BR")}</b> participações</p><p><b>{Number(dropRate).toLocaleString("pt-BR",{maximumFractionDigits:1})}%</b> de drops</p></div>
    </div>
    <div className="homepage-metrics-status">
      <h3>Como termina a sessão?</h3>
      <p className="homepage-metrics-intro">Os números entregam o nosso jeito de jogar.</p>
      <ul>{legendItems.map(item => {
        const note = STATUS_NOTES[item.key as keyof typeof STATUS_NOTES]
        const Icon = note.icon
        return <li className={`homepage-status-note homepage-status-${item.key}`} key={item.key}>
          <div className="homepage-status-top"><Icon size={22} strokeWidth={2.2} aria-hidden="true" /><h4>{note.title}</h4><strong>{item.percentage.toLocaleString("pt-BR",{maximumFractionDigits:1})}%</strong></div>
          <div className="homepage-status-bar" role="img" aria-label={`${item.label}: ${item.value} participações, ${item.percentage.toFixed(1)}%`}><span style={{width:`${item.percentage}%`}} /></div>
          <p>{note.hint}<span>{item.value.toLocaleString("pt-BR")}</span></p>
        </li>
      })}</ul>
    </div>
  </div>
}
