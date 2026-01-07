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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddPlayerDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddPlayerDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: AddPlayerDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState("")
  const [discordId, setDiscordId] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Nome é obrigatório")
      return
    }

    if (!discordId.trim()) {
      alert("Discord ID é obrigatório")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    // Verificar se o discord_id já existe
    const { data: existing } = await supabase.from("players").select("id").eq("discord_id", discordId.trim()).single()

    if (existing) {
      alert("Este Discord ID já está cadastrado")
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from("players").insert({
      name: name.trim(),
      discord_id: discordId.trim(),
      avatar_url: avatarUrl.trim() || null,
    })

    if (error) {
      console.error("[v0] Error creating player:", error)
      alert("Erro ao criar jogador: " + error.message)
    } else {
      setName("")
      setDiscordId("")
      setAvatarUrl("")
      setOpen(false)
      // Removed router.refresh() that caused white flashing on page changes
    }

    setIsLoading(false)
  }

  const dialogContent = (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Jogador
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Jogador</DialogTitle>
            <DialogDescription>Adicione um novo jogador ao seu grupo</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Saudades"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discord">Discord ID *</Label>
              <Input
                id="discord"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="Ex: @saudades ou 123456789"
                required
              />
              <p className="text-xs text-muted-foreground">Usado para integração com o bot do Discord</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">URL do Avatar (opcional)</Label>
              <Input
                id="avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Jogador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return dialogContent
}
