"use client"

import { useState, type ReactNode } from "react"
import { LayoutGrid, List } from "lucide-react"
import {
  PlayerProfilePanel,
  PlayerProfileSectionHeader,
} from "@/components/player-profile/player-profile-panel"
import { RecentGameItems } from "@/components/player-profile/player-profile-recent-games-items"
import type { PlayerProfileGameEntry } from "@/lib/player-profile-helpers"
import { cn } from "@/lib/utils"

interface PlayerProfileRecentGamesProps {
  games: PlayerProfileGameEntry[]
}

type RecentGamesView = "grid" | "list"

export function PlayerProfileRecentGames({ games }: PlayerProfileRecentGamesProps) {
  const [view, setView] = useState<RecentGamesView>("list")

  if (games.length === 0) {
    return (
      <PlayerProfilePanel className="py-12 text-center text-muted-foreground">
        Nenhum jogo recente registrado
      </PlayerProfilePanel>
    )
  }

  return (
    <section>
      <PlayerProfileSectionHeader
        title="Jogados recentemente"
        description="Ordenado pela última sessão registrada"
        action={<ViewToggle view={view} onViewChange={setView} />}
      />

      {view === "list" ? (
        <PlayerProfilePanel padding="compact">
          <RecentGameItems games={games} view="list" />
        </PlayerProfilePanel>
      ) : (
        <RecentGameItems games={games} view="grid" />
      )}
    </section>
  )
}

function ViewToggle({
  view,
  onViewChange,
}: {
  view: RecentGamesView
  onViewChange: (view: RecentGamesView) => void
}) {
  return (
    <div
      className="flex shrink-0 gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-1"
      role="group"
      aria-label="Modo de visualização"
    >
      <ToggleButton
        pressed={view === "grid"}
        label="Visualização em grade"
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
      </ToggleButton>
      <ToggleButton
        pressed={view === "list"}
        label="Visualização em lista"
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" strokeWidth={1.75} />
      </ToggleButton>
    </div>
  )
}

function ToggleButton({
  pressed,
  label,
  onClick,
  children,
}: {
  pressed: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full transition-[background-color,color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
        pressed
          ? "bg-white/[0.12] text-foreground"
          : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
