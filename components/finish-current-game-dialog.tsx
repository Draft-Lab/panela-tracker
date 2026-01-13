"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FinishCurrentGameDialogProps {
  jogatinaId: string
  gameTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PlayerStatus {
  id: string
  player: {
    id: string
    name: string
    avatar_url: string | null
  }
  status: "Dropo" | "Zero" | "Dava pra jogar" | "Jogatina"
  notes: string
}

export function FinishCurrentGameDialog({ jogatinaId, gameTitle, open, onOpenChange }: FinishCurrentGameDialogProps) {
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadPlayerStatuses()
    }
  }, [open, jogatinaId])

  const loadPlayerStatuses = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("jogatina_players")
      .select("*, player:players(*)")
      .eq("jogatina_id", jogatinaId)

    if (error) {
      console.error("[v0] Error loading player statuses:", error)
    } else {
      setPlayerStatuses(
        (data || []).map((jp) => ({
          id: jp.id,
          player: jp.player,
          status: jp.status,
          notes: jp.notes || "",
        })),
      )
    }
  }

  const updatePlayerStatus = (id: string, field: "status" | "notes", value: string) => {
    setPlayerStatuses((prev) => prev.map((ps) => (ps.id === id ? { ...ps, [field]: value } : ps)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    // Update all player statuses
    const updatePromises = playerStatuses.map((ps) =>
      supabase
        .from("jogatina_players")
        .update({
          status: ps.status,
          notes: ps.notes.trim() || null,
        })
        .eq("id", ps.id),
    )

    const results = await Promise.all(updatePromises)
    const hasError = results.some((r) => r.error)

    if (hasError) {
      console.error("[v0] Error updating player statuses")
      alert("Erro ao atualizar status dos jogadores")
      setIsLoading(false)
      return
    }

    // Mark jogatina as not current
    const { error: jogatinaError } = await supabase.from("jogatinas").update({ is_current: false }).eq("id", jogatinaId)

    if (jogatinaError) {
      console.error("[v0] Error finishing jogatina:", jogatinaError)
      alert("Erro ao finalizar jogatina")
    } else {
      onOpenChange(false)
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Finalizar Jogo Atual</DialogTitle>
            <DialogDescription>
              Finalize a jogatina de <strong>{gameTitle}</strong> e registre o status final de cada jogador
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {playerStatuses.map((ps) => (
              <div key={ps.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ps.player.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{ps.player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{ps.player.name}</span>
                </div>

                <div className="grid gap-2">
                  <Label>Status Final</Label>
                  <Select value={ps.status} onValueChange={(value) => updatePlayerStatus(ps.id, "status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jogatina">Jogatina</SelectItem>
                      <SelectItem value="Dropo">Dropo</SelectItem>
                      <SelectItem value="Zero">Zero</SelectItem>
                      <SelectItem value="Dava pra jogar">Dava pra jogar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Observações (opcional)</Label>
                  <Input
                    value={ps.notes}
                    onChange={(e) => updatePlayerStatus(ps.id, "notes", e.target.value)}
                    placeholder="Ex: Dropou porque tinha compromisso"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Finalizando..." : "Finalizar Jogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
