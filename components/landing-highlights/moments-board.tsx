import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import type { Game } from "@/lib/types"

export interface MomentRecord { key: string; game: Game; label: string; icon: LucideIcon; badge: string; meta: string }

export function MomentsBoard({ moments }: { moments: MomentRecord[] }) {
  return <div className="homepage-moments-board">
    <ul className="homepage-moments-cards">{moments.map((moment) => {
      const Icon = moment.icon
      return <li className={`homepage-moment homepage-moment-${moment.key}`} key={moment.key}>
        <span className="homepage-moment-tab"><Icon size={18} aria-hidden="true" />{moment.label}</span>
        <div className="homepage-moment-cover">{moment.game.cover_url && <Image src={moment.game.cover_url} alt="" fill sizes="(max-width: 767px) 80vw, 300px" className="object-cover" />}</div>
        <div className="homepage-moment-copy"><h3>{moment.game.title}</h3><strong>{moment.badge}</strong><p>{moment.meta}</p></div>
      </li>
    })}</ul>
  </div>
}
