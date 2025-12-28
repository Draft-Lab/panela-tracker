"use client"

import { useState, useEffect, useRef } from "react"
import type { Game } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dices, CheckCheck, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface GameRouletteProps {
  games: Game[]
}

export function GameRoulette({ games }: GameRouletteProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<Game | null>(null)
  const [displayedGame, setDisplayedGame] = useState<Game | null>(null)
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with all games selected
  useEffect(() => {
    setSelectedGames(games.map((g) => g.id))
  }, [games])

  const toggleGame = (gameId: string) => {
    setSelectedGames((prev) => (prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]))
  }

  const selectAll = () => {
    setSelectedGames(games.map((g) => g.id))
  }

  const deselectAll = () => {
    setSelectedGames([])
  }

  const spinRoulette = () => {
    if (selectedGames.length === 0) return

    setIsSpinning(true)
    setWinner(null)

    const availableGames = games.filter((g) => selectedGames.includes(g.id))
    let counter = 0
    const maxSpins = 30 + Math.floor(Math.random() * 20)

    spinIntervalRef.current = setInterval(
      () => {
        const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)]
        setDisplayedGame(randomGame)
        counter++

        if (counter >= maxSpins) {
          if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
          const finalWinner = availableGames[Math.floor(Math.random() * availableGames.length)]
          setDisplayedGame(finalWinner)
          setWinner(finalWinner)
          setIsSpinning(false)
        }
      },
      100 + counter * 5,
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Roleta de Jogos</h1>
        <p className="text-muted-foreground mt-1">Deixe o destino escolher o próximo jogo!</p>
      </div>

      {/* Roulette Display */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
            {!winner && !isSpinning && (
              <div className="text-center space-y-4">
                <Dices className="h-24 w-24 mx-auto text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Clique em girar para sortear um jogo!</p>
              </div>
            )}

            {isSpinning && displayedGame && (
              <div className="text-center space-y-4 animate-pulse">
                {displayedGame.cover_url ? (
                  <img
                    src={displayedGame.cover_url || "/placeholder.svg"}
                    alt={displayedGame.title}
                    className="w-48 h-48 object-cover rounded-lg mx-auto border-4 border-primary"
                  />
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mx-auto border-4 border-primary">
                    <Dices className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <h3 className="text-2xl font-bold">{displayedGame.title}</h3>
              </div>
            )}

            {winner && (
              <div className="text-center space-y-4 animate-in zoom-in duration-500">
                <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                {winner.cover_url ? (
                  <img
                    src={winner.cover_url || "/placeholder.svg"}
                    alt={winner.title}
                    className="w-64 h-64 object-cover rounded-lg mx-auto border-4 border-yellow-500 shadow-lg"
                  />
                ) : (
                  <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mx-auto border-4 border-yellow-500">
                    <Dices className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Badge variant="default" className="mb-2 bg-yellow-500 text-black">
                    VENCEDOR
                  </Badge>
                  <h3 className="text-3xl font-bold">{winner.title}</h3>
                </div>
              </div>
            )}

            <Button
              size="lg"
              onClick={spinRoulette}
              disabled={isSpinning || selectedGames.length === 0}
              className="mt-4"
            >
              <Dices className="h-5 w-5 mr-2" />
              {isSpinning ? "Girando..." : "Girar Roleta"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Selecionar Jogos</CardTitle>
              <CardDescription>
                Escolha quais jogos participam do sorteio ({selectedGames.length} selecionados)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Todos
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
            {games.map((game) => (
              <label
                key={game.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent",
                  selectedGames.includes(game.id) ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <Checkbox checked={selectedGames.includes(game.id)} onCheckedChange={() => toggleGame(game.id)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{game.title}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
