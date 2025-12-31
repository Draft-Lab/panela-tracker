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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { Player, JogatinaWithDetails } from "@/lib/types";

interface EditJogatinaDialogProps {
  jogatina: JogatinaWithDetails;
  allPlayers: Player[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlayerStatus {
  id?: string; // Se já existe no banco
  player_id: string;
  status: "Dropo" | "Zero" | "Dava pra jogar";
  notes: string;
  isNew?: boolean; // Flag para saber se é novo
}

export function EditJogatinaDialog({
  jogatina,
  allPlayers,
  open,
  onOpenChange,
}: EditJogatinaDialogProps) {
  const [notes, setNotes] = useState(jogatina.notes || "");
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedNewPlayer, setSelectedNewPlayer] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open && jogatina.jogatina_players) {
      setNotes(jogatina.notes || "");
      setPlayerStatuses(
        jogatina.jogatina_players.map((jp) => ({
          id: jp.id,
          player_id: jp.player_id,
          status: jp.status,
          notes: jp.notes || "",
          isNew: false,
        })),
      );
      setShowAddPlayer(false);
      setSelectedNewPlayer("");
    }
  }, [open, jogatina]);

  const updatePlayerStatus = (
    playerId: string,
    field: "status" | "notes",
    value: string,
  ) => {
    setPlayerStatuses((prev) =>
      prev.map((ps) =>
        ps.player_id === playerId ? { ...ps, [field]: value } : ps,
      ),
    );
  };

  const removePlayer = (playerId: string) => {
    setPlayerStatuses((prev) => prev.filter((ps) => ps.player_id !== playerId));
  };

  const addNewPlayer = () => {
    if (!selectedNewPlayer) return;

    // Verificar se jogador já está na lista
    if (playerStatuses.some((ps) => ps.player_id === selectedNewPlayer)) {
      alert("Este jogador já está na jogatina!");
      return;
    }

    setPlayerStatuses((prev) => [
      ...prev,
      {
        player_id: selectedNewPlayer,
        status: "Dava pra jogar",
        notes: "",
        isNew: true,
      },
    ]);

    setSelectedNewPlayer("");
    setShowAddPlayer(false);
  };

  const availablePlayers = allPlayers.filter(
    (p) => !playerStatuses.some((ps) => ps.player_id === p.id),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    try {
      // 1. Atualizar notes da jogatina
      await supabase
        .from("jogatinas")
        .update({ notes: notes.trim() || null })
        .eq("id", jogatina.id);

      // 2. Processar jogadores existentes (update)
      const existingPlayers = playerStatuses.filter((ps) => ps.id && !ps.isNew);
      for (const ps of existingPlayers) {
        await supabase
          .from("jogatina_players")
          .update({
            status: ps.status,
            notes: ps.notes.trim() || null,
          })
          .eq("id", ps.id);
      }

      // 3. Adicionar novos jogadores
      const newPlayers = playerStatuses.filter((ps) => ps.isNew);
      if (newPlayers.length > 0) {
        await supabase.from("jogatina_players").insert(
          newPlayers.map((ps) => ({
            jogatina_id: jogatina.id,
            player_id: ps.player_id,
            status: ps.status,
            notes: ps.notes.trim() || null,
          })),
        );
      }

      // 4. Remover jogadores que foram deletados
      const currentPlayerIds = playerStatuses.map((ps) => ps.player_id);
       const originalPlayerIds = jogatina.jogatina_players.map(
         (jp) => jp.player_id,
       );
      const removedPlayerIds = originalPlayerIds.filter(
        (id: string) => !currentPlayerIds.includes(id),
      );

      if (removedPlayerIds.length > 0) {
        await supabase
          .from("jogatina_players")
          .delete()
          .eq("jogatina_id", jogatina.id)
          .in("player_id", removedPlayerIds);
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("[v0] Error updating jogatina:", error);
      alert("Erro ao atualizar jogatina. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayer = (playerId: string) => {
    return allPlayers.find((p) => p.id === playerId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Jogatina</DialogTitle>
            <DialogDescription>
              Edite os participantes e seus status para{" "}
              <strong>{jogatina.game?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Data da jogatina */}
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Data:{" "}
                <span className="font-medium text-foreground">
                  {new Date(jogatina.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>

            {/* Notes da jogatina */}
            <div className="grid gap-2">
              <Label htmlFor="jogatina-notes">Observações da Jogatina</Label>
              <Textarea
                id="jogatina-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Demo do jogo, sessão rápida"
                rows={2}
              />
            </div>

            {/* Lista de jogadores */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>
                  Participantes ({playerStatuses.length}{" "}
                  {playerStatuses.length === 1 ? "jogador" : "jogadores"})
                </Label>
                {!showAddPlayer && availablePlayers.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPlayer(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Jogador
                  </Button>
                )}
              </div>

              {/* Adicionar novo jogador */}
              {showAddPlayer && (
                <div className="p-4 border rounded-lg mb-3 bg-accent/50">
                  <Label className="mb-2 block">Selecionar Jogador</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedNewPlayer}
                      onValueChange={setSelectedNewPlayer}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Escolha um jogador" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={player.avatar_url || undefined}
                                />
                                <AvatarFallback className="text-xs">
                                  {player.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{player.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={addNewPlayer}
                      disabled={!selectedNewPlayer}
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowAddPlayer(false);
                        setSelectedNewPlayer("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de participantes */}
              {playerStatuses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum participante. Adicione pelo menos um jogador.
                </p>
              )}

              <div className="space-y-3">
                {playerStatuses.map((ps) => {
                  const player = getPlayer(ps.player_id);
                  if (!player) return null;

                  return (
                    <div
                      key={ps.player_id}
                      className="p-4 border rounded-lg space-y-3 bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={player.avatar_url || undefined} />
                          <AvatarFallback className="text-sm">
                            {player.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{player.name}</p>
                          {ps.isNew && (
                            <Badge
                              variant="outline"
                              className="text-xs text-green-500 border-green-500"
                            >
                              Novo
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(ps.player_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                          value={ps.status}
                          onValueChange={(value) =>
                            updatePlayerStatus(ps.player_id, "status", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dropo">
                              <Badge
                                variant="outline"
                                className="text-red-500 border-red-500"
                              >
                                Dropo
                              </Badge>
                            </SelectItem>
                            <SelectItem value="Zero">
                              <Badge
                                variant="outline"
                                className="text-green-500 border-green-500"
                              >
                                Zero
                              </Badge>
                            </SelectItem>
                            <SelectItem value="Dava pra jogar">
                              <Badge
                                variant="outline"
                                className="text-yellow-500 border-yellow-500"
                              >
                                Dava pra jogar
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Observações (opcional)</Label>
                        <Input
                          value={ps.notes}
                          onChange={(e) =>
                            updatePlayerStatus(
                              ps.player_id,
                              "notes",
                              e.target.value,
                            )
                          }
                          placeholder="Ex: Saiu mais cedo"
                        />
                      </div>
                    </div>
                  );
                })}
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
            <Button
              type="submit"
              disabled={isLoading || playerStatuses.length === 0}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
