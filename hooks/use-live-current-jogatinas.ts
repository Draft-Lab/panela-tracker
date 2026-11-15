"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import {
  fetchCurrentJogatinas,
  type LandingCurrentJogatina,
} from "@/lib/fetch-current-jogatinas"
import { createClient } from "@/lib/supabase/client"

type JogatinaEventRow = {
  id?: string
  jogatina_id?: string
  player_id?: string
  event_type?: string
  timestamp?: string
}

const REFETCH_DEBOUNCE_MS = 300
const MAX_LIVE_EVENTS = 8

export type LiveSessionEvent = {
  id: string
  playerId: string
  playerName: string
  gameTitle: string
  eventType: "player_joined" | "player_left"
  timestamp: string
}

function findJogatinaContext(
  games: LandingCurrentJogatina[],
  jogatinaId: string,
  playerId: string,
) {
  const jogatina = games.find((item) => item.id === jogatinaId)
  const playerRow = jogatina?.jogatina_players?.find(
    (row) => row.player_id === playerId,
  )
  return {
    playerName: playerRow?.player?.name,
    gameTitle: jogatina?.game?.title,
  }
}

function resolveLiveEvent(
  payload: {
    id?: string
    jogatina_id?: string
    player_id?: string
    event_type?: string
    timestamp?: string
  },
  nextGames: LandingCurrentJogatina[],
  previousGames: LandingCurrentJogatina[],
): LiveSessionEvent | null {
  if (
    !payload.id ||
    !payload.jogatina_id ||
    !payload.player_id ||
    (payload.event_type !== "player_joined" &&
      payload.event_type !== "player_left") ||
    !payload.timestamp
  ) {
    return null
  }

  const fromNext = findJogatinaContext(
    nextGames,
    payload.jogatina_id,
    payload.player_id,
  )
  const fromPrevious = findJogatinaContext(
    previousGames,
    payload.jogatina_id,
    payload.player_id,
  )

  return {
    id: payload.id,
    playerId: payload.player_id,
    playerName: fromNext.playerName ?? fromPrevious.playerName ?? "Alguém",
    gameTitle: fromNext.gameTitle ?? fromPrevious.gameTitle ?? "um jogo",
    eventType: payload.event_type,
    timestamp: payload.timestamp,
  }
}

export function useLiveCurrentJogatinas(initialData: LandingCurrentJogatina[]) {
  const [currentGames, setCurrentGames] =
    useState<LandingCurrentJogatina[]>(initialData)
  const [liveEvents, setLiveEvents] = useState<LiveSessionEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const currentGamesRef = useRef(currentGames)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingEventPayloadsRef = useRef<JogatinaEventRow[]>([])

  useEffect(() => {
    currentGamesRef.current = currentGames
  }, [currentGames])

  useEffect(() => {
    setCurrentGames(initialData)
  }, [initialData])

  const refetch = useCallback(async () => {
    try {
      const previousGames = currentGamesRef.current
      const supabase = createClient()
      const nextGames = await fetchCurrentJogatinas(
        supabase as unknown as Parameters<typeof fetchCurrentJogatinas>[0],
      )
      setCurrentGames(nextGames)
      currentGamesRef.current = nextGames

      const pending = pendingEventPayloadsRef.current
      pendingEventPayloadsRef.current = []

      if (pending.length === 0) {
        return
      }

      const resolved = pending
        .map((payload) =>
          resolveLiveEvent(payload, nextGames, previousGames),
        )
        .filter((event): event is LiveSessionEvent => event !== null)

      if (resolved.length === 0) {
        return
      }

      setLiveEvents((prev) => {
        const seen = new Set(prev.map((event) => event.id))
        const merged = [
          ...resolved.filter((event) => !seen.has(event.id)),
          ...prev,
        ]
        return merged.slice(0, MAX_LIVE_EVENTS)
      })
    } catch (error) {
      console.error("[useLiveCurrentJogatinas] refetch failed", error)
    }
  }, [])

  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      void refetch()
    }, REFETCH_DEBOUNCE_MS)
  }, [refetch])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("live-current-jogatinas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jogatinas" },
        () => {
          scheduleRefetch()
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jogatina_players" },
        () => {
          scheduleRefetch()
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jogatina_events" },
        (payload: RealtimePostgresChangesPayload<JogatinaEventRow>) => {
          if (payload.eventType === "INSERT" && payload.new) {
            pendingEventPayloadsRef.current.push(payload.new as JogatinaEventRow)
          }
          scheduleRefetch()
        },
      )
      .subscribe((status: string) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      void supabase.removeChannel(channel)
    }
  }, [scheduleRefetch])

  return { currentGames, liveEvents, isConnected }
}
