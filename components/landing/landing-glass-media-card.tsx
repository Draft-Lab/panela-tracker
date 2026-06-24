import type { ReactNode } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"

interface LandingGlassMediaCardProps {
  coverSrc?: string | null
  coverAlt: string
  children: ReactNode
  className?: string
  contentClassName?: string
  minHeight?: string
}

export function LandingGlassMediaCard({
  coverSrc,
  coverAlt,
  children,
  className,
  contentClassName,
  minHeight,
}: LandingGlassMediaCardProps) {
  return (
    <LandingGlassCell
      className={cn("h-full", className)}
      innerClassName={cn("relative overflow-hidden p-0", minHeight)}
    >
      {coverSrc ? (
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center blur-md brightness-[0.42] saturate-110 scale-105"
          />
          <div className="absolute inset-0 bg-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/40" />
        </div>
      ) : null}

      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </LandingGlassCell>
  )
}

interface LandingMediaStripProps {
  coverSrc?: string | null
  coverAlt: string
  children: ReactNode
  className?: string
}

/** @deprecated Prefer LandingTimelineCard for timeline entries */
export function LandingMediaStrip({
  coverSrc,
  coverAlt,
  children,
  className,
}: LandingMediaStripProps) {
  return (
    <LandingGlassCell className={className} innerClassName="overflow-hidden p-0">
      <div className="flex min-h-[7.5rem] flex-col sm:flex-row sm:items-stretch">
        <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-32 md:w-36">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={coverAlt}
              fill
              sizes="(max-width: 640px) 100vw, 144px"
              className="object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background/30 sm:bg-gradient-to-r sm:from-black/5 sm:via-transparent sm:to-background/20" />
        </div>
        <div className="min-w-0 flex-1 p-4 md:p-5">{children}</div>
      </div>
    </LandingGlassCell>
  )
}

interface LandingTimelineCardProps {
  coverSrc?: string | null
  coverAlt: string
  children: ReactNode
  isLive?: boolean
}

export function LandingTimelineCard({
  coverSrc,
  coverAlt,
  children,
  isLive = false,
}: LandingTimelineCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-card/35 p-2.5 transition-[box-shadow,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-card/45 hover:shadow-[0_4px_20px_rgba(0,0,0,0.22)] sm:p-3">
      <div className="flex items-start gap-3">
        <div className="relative h-[3.25rem] w-[2.4rem] shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-white/10 sm:h-14 sm:w-11">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={coverAlt}
              fill
              sizes="44px"
              className="object-cover object-center"
            />
          ) : null}
          {isLive && (
            <span className="absolute bottom-1 left-1 flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          )}
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
