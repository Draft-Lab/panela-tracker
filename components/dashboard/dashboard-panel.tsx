import type { ReactNode } from "react"
import {
  LandingGlassCell,
} from "@/components/landing/landing-glass-cell"

interface DashboardPanelProps {
  children: ReactNode
  className?: string
  innerClassName?: string
}

export function DashboardPanel({
  children,
  className,
  innerClassName,
}: DashboardPanelProps) {
  return (
    <LandingGlassCell className={className} innerClassName={innerClassName}>
      {children}
    </LandingGlassCell>
  )
}

export function DashboardEmptyState({ children }: { children: ReactNode }) {
  return (
    <LandingGlassCell innerClassName="flex items-center justify-center py-12 text-center">
      <div className="text-sm text-muted-foreground">{children}</div>
    </LandingGlassCell>
  )
}
