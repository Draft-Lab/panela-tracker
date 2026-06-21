"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import {
  formatLiveSessionElapsed,
  formatLiveSessionStartLabelCompact,
} from "@/lib/live-session-helpers"

interface LiveSessionMetaProps {
  startedAt: string
}

export function LiveSessionMeta({ startedAt }: LiveSessionMetaProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [])

  const elapsed = formatLiveSessionElapsed(startedAt, now)
  const startLabel = formatLiveSessionStartLabelCompact(startedAt, now)

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1 tabular-nums">
        <Clock className="h-3 w-3 shrink-0" strokeWidth={2} />
        {elapsed}
      </span>
      <span aria-hidden className="text-border/80">
        ·
      </span>
      <span className="truncate">{startLabel}</span>
    </p>
  )
}
