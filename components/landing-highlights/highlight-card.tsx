import type { LucideIcon } from "lucide-react"
import type { Game } from "@/lib/types"
import {
  LandingCoverThumb,
  LandingGlassCell,
} from "@/components/landing/landing-glass-cell"

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
    <LandingGlassCell
      className="h-full"
      innerClassName="flex h-full flex-col gap-4 p-4 sm:p-5"
    >
      <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        {label}
      </p>

      <div className="mt-auto flex items-start gap-3.5">
        <LandingCoverThumb
          src={game.cover_url}
          alt={game.title}
          size="md"
          imageSizes="52px"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.02em] text-foreground">
            {game.title}
          </h3>
          <p className="inline-flex rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-white/[0.08]">
            {badge}
          </p>
          {meta && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {meta}
            </p>
          )}
        </div>
      </div>
    </LandingGlassCell>
  )
}
