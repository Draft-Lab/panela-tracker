import type { ReactNode } from "react"
import Image from "next/image"
import { Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingGlassCellProps {
  children: ReactNode
  className?: string
  innerClassName?: string
}

export function LandingGlassCell({
  children,
  className,
  innerClassName,
}: LandingGlassCellProps) {
  return (
    <div
      className={cn(
        "@container rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10",
        "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-[calc(2rem-0.375rem)] bg-card/50 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface LandingMetricProps {
  label: string
  value: ReactNode
  meta?: string
  valueClassName?: string
}

export function LandingMetric({
  label,
  value,
  meta,
  valueClassName,
}: LandingMetricProps) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div
        className={cn(
          "mt-2 min-w-0 font-semibold tabular-nums tracking-[-0.03em] text-foreground",
          valueClassName,
        )}
      >
        {value}
      </div>
      {meta && (
        <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
          {meta}
        </p>
      )}
    </div>
  )
}

export function LandingEmptyState({ children }: { children: ReactNode }) {
  return (
    <LandingGlassCell innerClassName="flex items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </LandingGlassCell>
  )
}

interface LandingLiveIndicatorProps {
  active?: boolean
  label?: string
  className?: string
}

export function LandingLiveIndicator({
  active = true,
  label = "Ao vivo",
  className,
}: LandingLiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-40",
            active ? "animate-ping bg-emerald-400" : "bg-muted-foreground/40",
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            active ? "bg-emerald-500" : "bg-muted-foreground/60",
          )}
        />
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

const COVER_SIZES = {
  sm: "h-14 w-14 rounded-[calc(0.875rem-0.2rem)]",
  md: "h-[4.5rem] w-[4.5rem] rounded-[calc(1rem-0.25rem)]",
  lg: "h-20 w-20 rounded-[calc(1.125rem-0.25rem)]",
} as const

interface LandingCoverThumbProps {
  src?: string | null
  alt: string
  size?: keyof typeof COVER_SIZES
  imageSizes?: string
}

export function LandingCoverThumb({
  src,
  alt,
  size = "md",
  imageSizes = "72px",
}: LandingCoverThumbProps) {
  return (
    <div className="shrink-0 rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10">
      <div
        className={cn(
          "relative overflow-hidden bg-muted shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
          COVER_SIZES[size],
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={imageSizes}
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2
              className={cn(
                "text-muted-foreground",
                size === "lg" ? "h-7 w-7" : "h-5 w-5",
              )}
              strokeWidth={1.75}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use LandingGlassCell */
export const LandingHeroGlassCell = LandingGlassCell

/** @deprecated Use LandingMetric */
export const LandingHeroMetric = LandingMetric
