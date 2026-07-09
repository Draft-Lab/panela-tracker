import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import type { Game } from "@/lib/types"
import { cn } from "@/lib/utils"
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
  variant?: "featured" | "compact"
}

export function HighlightCard({
  game,
  label,
  icon: Icon,
  badge,
  meta,
  variant = "compact",
}: HighlightCardProps) {
  if (variant === "featured") {
    return (
      <LandingGlassCell
        className="h-full"
        innerClassName="relative overflow-hidden p-0"
      >
        <div className="flex min-h-[11rem] flex-col sm:min-h-[12.5rem] sm:flex-row sm:items-stretch">
          <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-44 md:w-52">
            {game.cover_url ? (
              <Image
                src={game.cover_url}
                alt={game.title}
                fill
                sizes="(max-width: 640px) 100vw, 208px"
                className="object-cover object-center"
              />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background/40 sm:bg-gradient-to-r sm:from-black/5 sm:via-transparent sm:to-background/30" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-6 md:p-7">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {label}
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground text-balance md:text-2xl">
              {game.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground">
                {badge}
              </p>
              {meta && (
                <p className="text-xs text-muted-foreground">{meta}</p>
              )}
            </div>
          </div>
        </div>
      </LandingGlassCell>
    )
  }

  return (
    <LandingGlassCell
      className="h-full"
      innerClassName="flex h-full flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {label}
        </p>
        <LandingCoverThumb src={game.cover_url} alt={game.title} size="sm" />
      </div>

      <div className="mt-auto space-y-2">
        <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
          {game.title}
        </h3>
        <p
          className={cn(
            "inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground",
          )}
        >
          {badge}
        </p>
        {meta && (
          <p className="text-xs leading-relaxed text-muted-foreground">{meta}</p>
        )}
      </div>
    </LandingGlassCell>
  )
}
