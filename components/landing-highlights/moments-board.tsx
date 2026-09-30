import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import type { Game } from "@/lib/types"

export interface MomentRecord { key: string; game: Game; label: string; icon: LucideIcon; badge: string; meta: string }

export function MomentsBoard({ moments }: { moments: MomentRecord[] }) {
  return <div className="homepage-moments-board">
    <div className="homepage-moments-heading"><span className="homepage-paper-label">Isso fica pra história</span><p>{String(moments.length).padStart(2,"0")} lembranças da panela</p><img src="/panela-trophy.webp" alt="" width={600} height={600} loading="lazy" decoding="async" /></div>
    <ol className="homepage-moments-cards">{moments.map((moment,index) => {
      const Icon = moment.icon
      return <li className={`homepage-moment homepage-moment-${moment.key}`} key={moment.key}>
        <span className="homepage-moment-tab"><Icon size={18} aria-hidden="true" />{moment.label}</span>
        <div className="homepage-moment-cover">{moment.game.cover_url && <Image src={moment.game.cover_url} alt={moment.game.title} fill sizes="(max-width: 767px) 80vw, 300px" className="object-cover" />}<span>{String(index+1).padStart(2,"0")}</span></div>
        <div className="homepage-moment-copy"><h3>{moment.game.title}</h3><strong>{moment.badge}</strong><p>{moment.meta}</p></div>
      </li>
    })}</ol>
  </div>
}
