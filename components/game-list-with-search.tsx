"use client"

import type { Game } from "@/lib/types"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Monitor } from "lucide-react"
import { GameList } from "@/components/game-list"

interface GameListWithSearchProps {
  games: Game[]
}

type FilterTab = "todos" | "jogos" | "apps"

export function GameListWithSearch({ games }: GameListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("todos")

  const totalGames = games.filter((g) => !g.is_app).length
  const totalApps = games.filter((g) => g.is_app).length

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "jogos" && !game.is_app) ||
      (activeTab === "apps" && game.is_app)
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {(
          [
            { key: "todos", label: "Todos", count: games.length },
            { key: "jogos", label: "Jogos", count: totalGames },
            { key: "apps", label: "Aplicativos", count: totalApps },
          ] as { key: FilterTab; label: string; count: number }[]
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {key === "apps" && <Monitor className="h-3.5 w-3.5" />}
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={activeTab === "apps" ? "Buscar aplicativos..." : "Buscar jogos..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGames.length === 0 && searchTerm && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum resultado encontrado para &quot;{searchTerm}&quot;</p>
        </div>
      )}

      <GameList games={filteredGames} />
    </div>
  )
}
