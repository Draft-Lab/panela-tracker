import type { LucideIcon } from "lucide-react"
import type { Game } from "@/lib/types"
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell"
import { LandingGlassMediaCard } from "@/components/landing/landing-glass-media-card"

interface HighlightCardProps {
  game: Game
  label: string
  icon: LucideIcon
  badge: string
  meta?: string
}

export function HighlightCard({
  game,
  label,
  icon: Icon,
  badge,
  meta,
}: HighlightCardProps) {
  return (
    <LandingGlassMediaCard
      coverSrc={game.cover_url}
      coverAlt={game.title}
      className="h-full"
      contentClassName="flex h-full flex-col gap-5 p-5"
      minHeight="min-h-[200px]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {label}
        </p>
        <LandingCoverThumb src={game.cover_url} alt={game.title} size="md" />
      </div>

      <div className="mt-auto space-y-2">
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
          {game.title}
        </h3>
        <p className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground">
          {badge}
        </p>
        {meta && (
          <p className="text-xs leading-relaxed text-muted-foreground">{meta}</p>
        )}
      </div>
    </LandingGlassMediaCard>
  )
}
