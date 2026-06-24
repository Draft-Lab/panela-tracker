import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"

interface PlayerProfilePanelProps {
  children: ReactNode
  className?: string
  padding?: "default" | "none" | "compact"
}

const paddingClass = {
  default: "p-4 sm:p-5",
  compact: "p-3 sm:p-4",
  none: "p-0",
} as const

export function PlayerProfilePanel({
  children,
  className,
  padding = "default",
}: PlayerProfilePanelProps) {
  return (
    <LandingGlassCell
      className={cn("h-full", className)}
      innerClassName={paddingClass[padding]}
    >
      {children}
    </LandingGlassCell>
  )
}

interface PlayerProfileSectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PlayerProfileSectionHeader({
  title,
  description,
  action,
}: PlayerProfileSectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
