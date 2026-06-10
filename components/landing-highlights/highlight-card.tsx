import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { Gamepad2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Game } from "@/lib/types"

export type HighlightAccent = "violet" | "sky" | "amber"

const ACCENT_STYLES: Record<
  HighlightAccent,
  {
    label: string
    gradient: string
    ring: string
  }
> = {
  violet: {
    label: "text-violet-400",
    gradient: "from-violet-500/10 via-card/30 to-background",
    ring: "border-violet-500/30 bg-violet-500/10",
  },
  sky: {
    label: "text-sky-400",
    gradient: "from-sky-500/10 via-card/30 to-background",
    ring: "border-sky-500/30 bg-sky-500/10",
  },
  amber: {
    label: "text-amber-400",
    gradient: "from-amber-500/10 via-card/30 to-background",
    ring: "border-amber-500/30 bg-amber-500/10",
  },
}

interface HighlightCardProps {
  game: Game
  label: string
  icon: LucideIcon
  accent: HighlightAccent
  badge: string
  meta?: string
}

export function HighlightCard({
  game,
  label,
  icon: Icon,
  accent,
  badge,
  meta,
}: HighlightCardProps) {
  const styles = ACCENT_STYLES[accent]
  const coverUrl = game.cover_url

  return (
    <article className="group relative min-h-[200px] overflow-hidden rounded-xl border border-border/50">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center blur-sm brightness-[0.35] saturate-110 transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-background/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-muted/50 via-card/40 to-background",
              styles.gradient,
            )}
          />
        )}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              styles.label,
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
            {label}
          </p>

          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-white/10 shadow-md">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={game.title}
                fill
                sizes="48px"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/80">
                <Gamepad2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-5">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
            {game.title}
          </h3>

          <Badge variant="outline" className="mt-2 bg-background/40">
            {badge}
          </Badge>

          {meta && (
            <p className="mt-2 text-xs text-muted-foreground">{meta}</p>
          )}
        </div>
      </div>
    </article>
  )
}
