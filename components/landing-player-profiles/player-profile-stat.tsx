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
    <div className="flex flex-col gap-1.5 bg-card/35 px-3 py-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 shrink-0 text-muted-foreground/80" strokeWidth={1.75} />
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "text-lg font-semibold tabular-nums tracking-tight text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-[10px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
