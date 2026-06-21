import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerProfileStatProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  valueClassName?: string
}

export function PlayerProfileStat({
  label,
  value,
  hint,
  icon: Icon,
  valueClassName,
}: PlayerProfileStatProps) {
  return (
    <div className="flex flex-col justify-between gap-2 bg-background/35 px-3 py-2.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={2} />
      </div>
      <div>
        <p
          className={cn(
            "text-xl font-bold tabular-nums tracking-tight sm:text-2xl",
            valueClassName,
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}
