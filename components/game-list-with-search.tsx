"use client"

import type { Game } from "@/lib/types"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { GameList } from "@/components/game-list"

interface GameListWithSearchProps {
  games: Game[]
}

export function GameListWithSearch({ games }: GameListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar jogos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGames.length === 0 && searchTerm && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum jogo encontrado para "{searchTerm}"</p>
        </div>
      )}

      <GameList games={filteredGames} />
    </div>
  )
}
