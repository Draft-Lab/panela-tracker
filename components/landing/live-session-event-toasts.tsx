"use client"

import { useEffect, useRef } from "react"
import { LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"
import type { LiveSessionEvent } from "@/hooks/use-live-current-jogatinas"
import { playLiveSessionChime } from "@/lib/play-live-session-chime"
import { cn } from "@/lib/utils"

interface LiveSessionEventToastsProps {
  events: LiveSessionEvent[]
  appearance?: "default" | "cartoon"
}

function LiveToastCard({
  event,
  appearance,
}: {
  event: LiveSessionEvent
  appearance: "default" | "cartoon"
}) {
  const isJoin = event.eventType === "player_joined"
  const Icon = isJoin ? LogIn : LogOut
  const action = isJoin ? "entrou em" : "saiu de"

  return (
    <div
      className={cn(
        appearance === "cartoon"
          ? "homepage-live-toast"
          : "flex min-w-[260px] max-w-[340px] items-start gap-3 rounded-xl border border-white/10 bg-card/95 px-3.5 py-3 shadow-lg backdrop-blur-md",
      )}
    >
      <span
        className={cn(
          appearance === "cartoon"
            ? "homepage-live-toast-icon"
            : cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                isJoin
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300",
              ),
        )}
        data-kind={isJoin ? "join" : "leave"}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p
          className={cn(
            appearance === "cartoon"
              ? "homepage-live-toast-eyebrow"
              : "text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
          )}
        >
          Ao vivo
        </p>
        <p
          className={cn(
            appearance === "cartoon"
              ? "homepage-live-toast-text"
              : "text-sm leading-snug text-foreground",
          )}
        >
          <span className="font-semibold">{event.playerName}</span> {action}{" "}
          <span className="font-semibold">{event.gameTitle}</span>
        </p>
      </div>
    </div>
  )
}

export function LiveSessionEventToasts({
  events,
  appearance = "default",
}: LiveSessionEventToastsProps) {
  const seenIdsRef = useRef<Set<string>>(new Set())
  const primedRef = useRef(false)

  useEffect(() => {
    if (primedRef.current) {
      return
    }
    primedRef.current = true
    for (const event of events) {
      seenIdsRef.current.add(event.id)
    }
  }, [events])

  useEffect(() => {
    const fresh = events.filter((event) => !seenIdsRef.current.has(event.id))
    if (fresh.length === 0) {
      return
    }

    for (const event of fresh) {
      seenIdsRef.current.add(event.id)
      playLiveSessionChime(
        event.eventType === "player_joined" ? "join" : "leave",
      )
      toast.custom(
        () => <LiveToastCard event={event} appearance={appearance} />,
        {
          id: event.id,
          duration: 4200,
          position: appearance === "cartoon" ? "bottom-left" : "top-right",
        },
      )
    }
  }, [events, appearance])

  return null
}
