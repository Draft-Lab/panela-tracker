"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Game, Player } from "@/lib/types"

interface AddJogatinaProps {
  games: Game[]
  players: Player[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PlayerStatus {
  playerId: string
  status: "Dropo" | "Zero" | "Dava pra jogar"
  notes: string
}

export function AddJogatina({ games, players, open, onOpenChange }: AddJogatinaProps) {
  const router = useRouter()
  const [selectedGameId, setSelectedGameId] = useState("")
  const [notes, setNotes] = useState("")
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addPlayer = () => {
    setPlayerStatuses([...playerStatuses, { playerId: "", status: "Zero", notes: "" }])
  }

  const removePlayer = (index: number) => {
    setPlayerStatuses(playerStatuses.filter((_, i) => i !== index))
  }

  const updatePlayerStatus = (index: number, field: keyof PlayerStatus, value: string) => {
    const updated = [...playerStatuses]
    updated[index] = { ...updated[index], [field]: value }
    setPlayerStatuses(updated)
  }

  const availablePlayers = (currentIndex: number) => {
    const selectedPlayerIds = playerStatuses.map((ps, i) => (i !== currentIndex ? ps.playerId : null)).filter(Boolean)
    return players.filter((p) => !selectedPlayerIds.includes(p.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGameId || playerStatuses.length === 0) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Create jogatina
      const { data: jogatina, error: jogatinaError } = await supabase
        .from("jogatinas")
        .insert({
          game_id: selectedGameId,
          notes,
          date: new Date().toISOString(),
        })
        .select()
        .single()

      if (jogatinaError) throw jogatinaError

      // Add players to jogatina
      const jogatinaPlayersData = playerStatuses
        .filter((ps) => ps.playerId)
        .map((ps) => ({
          jogatina_id: jogatina.id,
          player_id: ps.playerId,
          status: ps.status,
          notes: ps.notes,
        }))

      const { error: playersError } = await supabase.from("jogatina_players").insert(jogatinaPlayersData)

      if (playersError) throw playersError

      // Reset form
      setSelectedGameId("")
      setNotes("")
      setPlayerStatuses([])
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating jogatina:", error)
      alert("Erro ao criar jogatina. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Jogatina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="game">Jogo *</Label>
            <Select value={selectedGameId} onValueChange={setSelectedGameId} required>
              <SelectTrigger id="game">
                <SelectValue placeholder="Selecione um jogo" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre esta jogatina..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Jogadores *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Jogador
              </Button>
            </div>

            {playerStatuses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Adicione pelo menos um jogador para criar a jogatina
              </p>
            )}

            <div className="space-y-3">
              {playerStatuses.map((ps, index) => {
                const selectedPlayer = players.find((p) => p.id === ps.playerId)
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            {selectedPlayer && (
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedPlayer.avatar_url || undefined} alt={selectedPlayer.name} />
                                <AvatarFallback>{selectedPlayer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                            <Select
                              value={ps.playerId}
                              onValueChange={(value) => updatePlayerStatus(index, "playerId", value)}
                              required
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecione um jogador" />
                              </SelectTrigger>
                              <SelectContent>
                                {availablePlayers(index).map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Badge
                              variant={ps.status === "Dropo" ? "destructive" : "outline"}
                              className="cursor-pointer"
                              onClick={() => updatePlayerStatus(index, "status", "Dropo")}
                            >
                              Dropo
                            </Badge>
                            <Badge
                              variant={ps.status === "Zero" ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => updatePlayerStatus(index, "status", "Zero")}
                            >
                              Zero
                            </Badge>
                            <Badge
                              variant={ps.status === "Dava pra jogar" ? "secondary" : "outline"}
                              className="cursor-pointer"
                              onClick={() => updatePlayerStatus(index, "status", "Dava pra jogar")}
                            >
                              Dava pra jogar
                            </Badge>
                          </div>

                          <Textarea
                            value={ps.notes}
                            onChange={(e) => updatePlayerStatus(index, "notes", e.target.value)}
                            placeholder="Observações sobre este jogador..."
                            rows={2}
                          />
                        </div>

                        <Button type="button" variant="ghost" size="icon" onClick={() => removePlayer(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedGameId || playerStatuses.length === 0}>
              {isSubmitting ? "Criando..." : "Criar Jogatina"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
