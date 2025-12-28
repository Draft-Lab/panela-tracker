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

interface AddGameDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddGameDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: AddGameDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("games").insert({
      title: title.trim(),
      cover_url: coverUrl.trim() || null,
    })

    if (error) {
      console.error("[v0] Error creating game:", error)
      alert("Erro ao criar jogo")
    } else {
      setTitle("")
      setCoverUrl("")
      setOpen(false)
      router.refresh()
    }

    setIsLoading(false)
  }

  const dialogContent = (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Jogo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Jogo</DialogTitle>
            <DialogDescription>Adicione um novo jogo à sua biblioteca</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Minecraft"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cover">URL da Capa (opcional)</Label>
              <Input
                id="cover"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://exemplo.com/capa.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Jogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return dialogContent
}
