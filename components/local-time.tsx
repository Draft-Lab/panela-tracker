"use client"

import { useMemo } from "react"
import { useIsClient } from "@/hooks/use-is-client"
import { formatLocalTime } from "@/lib/local-date"
import { cn } from "@/lib/utils"

interface LocalTimeProps {
  iso: string
  className?: string
}

export function LocalTime({ iso, className }: LocalTimeProps) {
  const isClient = useIsClient()
  const formatted = useMemo(
    () => (isClient ? formatLocalTime(iso) : null),
    [iso, isClient],
  )

  return (
    <time
      dateTime={iso}
      className={cn("tabular-nums", className)}
      suppressHydrationWarning
    >
      {formatted ?? "--:--"}
    </time>
  )
}
