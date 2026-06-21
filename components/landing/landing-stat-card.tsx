import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingStatCardProps {
  label: string
  value: string | number
  hint?: string
  detail?: string
  icon: LucideIcon
  className?: string
}

export function LandingStatCard({
  label,
  value,
  hint,
  detail,
  icon: Icon,
  className,
}: LandingStatCardProps) {
  return (
    <div className={cn("min-w-0 py-1", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold tabular-nums tracking-tight md:text-3xl">
            {value}
          </p>
          {detail && (
            <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground/65">
              {detail}
            </p>
          )}
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="shrink-0 text-primary/80">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
