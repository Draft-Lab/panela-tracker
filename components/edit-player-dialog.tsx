"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Player } from "@/lib/types"

interface EditPlayerDialogProps {
  player: Player
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPlayerDialog({ player, open, onOpenChange }: EditPlayerDialogProps) {
  const [name, setName] = useState(player.name)
  const [avatarUrl, setAvatarUrl] = useState(player.avatar_url || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("players")
      .update({
        name: name.trim(),
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", player.id)

    if (error) {
      console.error("[v0] Error updating player:", error)
      alert("Erro ao atualizar jogador")
    } else {
      onOpenChange(false)
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
            <DialogDescription>Atualize as informações do jogador</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Saudades"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-avatar">URL do Avatar (opcional)</Label>
              <Input
                id="edit-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
