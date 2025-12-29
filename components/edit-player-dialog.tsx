"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Player } from "@/lib/types";

interface EditPlayerDialogProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlayerDialog({
  player,
  open,
  onOpenChange,
}: EditPlayerDialogProps) {
  const [name, setName] = useState(player.name);
  const [discordId, setDiscordId] = useState(player.discord_id || "");
  const [avatarUrl, setAvatarUrl] = useState(player.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if (!discordId.trim()) {
      alert("Discord ID é obrigatório");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    // Verificar se o discord_id já existe em outro jogador
    if (discordId.trim() !== player.discord_id) {
      const { data: existing } = await supabase
        .from("players")
        .select("id")
        .eq("discord_id", discordId.trim())
        .neq("id", player.id)
        .single();

      if (existing) {
        alert("Este Discord ID já está cadastrado em outro jogador");
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from("players")
      .update({
        name: name.trim(),
        discord_id: discordId.trim(),
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", player.id);

    if (error) {
      console.error("[v0] Error updating player:", error);
      alert("Erro ao atualizar jogador: " + error.message);
    } else {
      onOpenChange(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
            <DialogDescription>
              Atualize as informações do jogador
            </DialogDescription>
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
              <Label htmlFor="edit-discord">Discord ID *</Label>
              <Input
                id="edit-discord"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="Ex: @saudades ou 123456789"
                required
              />
              <p className="text-xs text-muted-foreground">
                Usado para integração com o bot do Discord
              </p>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
