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
import type { Game } from "@/lib/types"
import { Search, Loader2 } from "lucide-react"

interface EditGameDialogProps {
  game: Game
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditGameDialog({ game, open, onOpenChange }: EditGameDialogProps) {
  const [title, setTitle] = useState(game.title)
  const [coverUrl, setCoverUrl] = useState(game.cover_url || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingImage, setIsSearchingImage] = useState(false)
  const router = useRouter()

  const handleSearchImage = async () => {
    if (!title.trim()) {
      alert("Digite o nome do jogo primeiro")
      return
    }

    setIsSearchingImage(true)
    try {
      const response = await fetch(`/api/games/search-image?title=${encodeURIComponent(title.trim())}`)
      const data = await response.json()
      
      if (data.imageUrl) {
        setCoverUrl(data.imageUrl)
        alert(`Imagem encontrada: ${data.gameName || title}`)
      } else {
        alert("Imagem não encontrada automaticamente. Você pode inserir a URL manualmente.")
      }
    } catch (error) {
      console.error("Erro ao buscar imagem:", error)
      alert("Erro ao buscar imagem. Tente inserir a URL manualmente.")
    } finally {
      setIsSearchingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("games")
      .update({
        title: title.trim(),
        cover_url: coverUrl.trim() || null,
      })
      .eq("id", game.id)

    if (error) {
      console.error("[v0] Error updating game:", error)
      alert("Erro ao atualizar jogo")
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
            <DialogTitle>Editar Jogo</DialogTitle>
            <DialogDescription>Atualize as informações do jogo</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Minecraft"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-cover">URL da Capa (opcional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSearchImage}
                  disabled={isSearchingImage || !title.trim()}
                >
                  {isSearchingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar Imagem
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="edit-cover"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://exemplo.com/capa.jpg"
              />
              {coverUrl && (
                <div className="mt-2">
                  <img
                    src={coverUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
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
