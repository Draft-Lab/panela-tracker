import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDropRate, type DropperStat } from "@/components/hall-of-shame/dropper-rank-utils"

export function HomepageWantedPosters({ droppers }: { droppers: DropperStat[] }) {
  return <div className="homepage-wanted-board">
    {droppers.map((stat, index) => <Link key={stat.playerId} href={`/jogadores/${stat.playerId}`} className="homepage-wanted-poster">
      <span className="homepage-wanted-rank">#{index + 1} no ranking</span>
      <h3>Procurado</h3>
      <p className="homepage-wanted-reason">Por abandonar a missão</p>
      <Avatar><AvatarImage src={stat.avatarUrl || undefined} alt="" /><AvatarFallback>{stat.playerName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
      <strong className="homepage-wanted-name">{stat.playerName}</strong>
      <div className="homepage-wanted-count"><strong>{stat.dropos}</strong><span>{stat.dropos === 1 ? "drop registrado" : "drops registrados"}</span></div>
      <p className="homepage-wanted-rate">{formatDropRate(stat)} · {stat.totalJogatinas} sessões</p>
      <span className="homepage-wanted-link">Ver ficha <ArrowUpRight size={14} aria-hidden="true" /></span>
    </Link>)}
  </div>
}
