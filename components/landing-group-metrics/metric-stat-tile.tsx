import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricStatTileProps {
  label: string
  value: string | number
  hint: string
  icon: LucideIcon
  valueClassName?: string
}

export function MetricStatTile({
  label,
  value,
  hint,
  icon: Icon,
  valueClassName,
}: MetricStatTileProps) {
  return (
    <div className="flex min-h-[108px] flex-col justify-between gap-3 bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      </div>

      <div>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl",
            valueClassName,
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}
