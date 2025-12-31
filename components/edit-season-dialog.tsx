"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Player, SeasonWithDetails } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface EditSeasonDialogProps {
  season: SeasonWithDetails;
  players: Player[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSeasonDialog({
  season,
  players,
  open,
  onOpenChange,
}: EditSeasonDialogProps) {
  const [name, setName] = useState(season.name);
  const [description, setDescription] = useState(season.description || "");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName(season.name);
      setDescription(season.description || "");
      setSelectedPlayers(
        season.season_participants?.map((sp) => sp.player_id) || [],
      );
    }
  }, [open, season]);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || selectedPlayers.length === 0) {
      alert("Nome e pelo menos um participante são obrigatórios!");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // 1. Atualizar temporada
      const { error: seasonError } = await supabase
        .from("seasons")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", season.id);

      if (seasonError) throw seasonError;

      // 2. Buscar participantes atuais
      const { data: currentParticipants } = await supabase
        .from("season_participants")
        .select("id, player_id")
        .eq("season_id", season.id);

      const currentPlayerIds =
        currentParticipants?.map((p) => p.player_id) || [];

      // 3. Adicionar novos participantes
      const playersToAdd = selectedPlayers.filter(
        (id) => !currentPlayerIds.includes(id),
      );
      if (playersToAdd.length > 0) {
        const newParticipants = playersToAdd.map((playerId) => ({
          season_id: season.id,
          player_id: playerId,
          status: "Em andamento" as const,
        }));

        await supabase.from("season_participants").insert(newParticipants);
      }

      // 4. Remover participantes desmarcados
      const playersToRemove = currentPlayerIds.filter(
        (id) => !selectedPlayers.includes(id),
      );
      if (playersToRemove.length > 0) {
        await supabase
          .from("season_participants")
          .delete()
          .eq("season_id", season.id)
          .in("player_id", playersToRemove);
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("[v0] Error updating season:", error);
      alert("Erro ao atualizar temporada. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Temporada</DialogTitle>
            <DialogDescription>
              Atualize as informações da temporada
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome da Temporada *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">
                Participantes * ({selectedPlayers.length} selecionado
                {selectedPlayers.length !== 1 ? "s" : ""})
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {players.map((player) => (
                  <label
                    key={player.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {player.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {player.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
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
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
