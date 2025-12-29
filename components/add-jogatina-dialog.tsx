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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Player } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerStatus {
  playerId: string;
  status: "Dropo" | "Zero" | "Dava pra jogar";
  notes: string;
}

interface AddJogatinaDialogProps {
  gameId: string;
}

export function AddJogatinaDialog({ gameId }: AddJogatinaDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionType, setSessionType] = useState<"solo" | "group">("group");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadPlayers();
      // Set default date to now
      const now = new Date();
      const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      setDate(localDate);
    }
  }, [open]);

  const loadPlayers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[v0] Error loading players:", error);
    } else {
      setPlayers(data || []);
    }
  };

  const addPlayerStatus = () => {
    if (players.length === 0) {
      alert("Cadastre jogadores primeiro!");
      return;
    }
    setPlayerStatuses([
      ...playerStatuses,
      { playerId: "", status: "Dava pra jogar", notes: "" },
    ]);
  };

  const removePlayerStatus = (index: number) => {
    setPlayerStatuses(playerStatuses.filter((_, i) => i !== index));
  };

  const updatePlayerStatus = (
    index: number,
    field: keyof PlayerStatus,
    value: string,
  ) => {
    const updated = [...playerStatuses];
    updated[index] = { ...updated[index], [field]: value };
    setPlayerStatuses(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || playerStatuses.length === 0) {
      alert("Preencha a data e adicione pelo menos um jogador!");
      return;
    }

    // Validar tipo de sessão
    if (sessionType === "solo" && playerStatuses.length !== 1) {
      alert("Sessões solo devem ter exatamente um jogador!");
      return;
    }

    if (sessionType === "group" && playerStatuses.length < 2) {
      alert("Sessões em grupo devem ter pelo menos dois jogadores!");
      return;
    }

    const invalidStatuses = playerStatuses.filter((ps) => !ps.playerId);
    if (invalidStatuses.length > 0) {
      alert("Selecione um jogador para cada entrada!");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const startedAt = new Date(date);

    // Create jogatina
    const { data: jogatina, error: jogatinaError } = await supabase
      .from("jogatinas")
      .insert({
        game_id: gameId,
        date: startedAt.toISOString(),
        started_at: startedAt.toISOString(),
        notes: notes.trim() || null,
        session_type: sessionType,
        source: "manual",
        is_current: false,
      })
      .select()
      .single();

    if (jogatinaError || !jogatina) {
      console.error("[v0] Error creating jogatina:", jogatinaError);
      alert("Erro ao criar jogatina");
      setIsLoading(false);
      return;
    }

    // Create player statuses
    const { error: playersError } = await supabase
      .from("jogatina_players")
      .insert(
        playerStatuses.map((ps) => ({
          jogatina_id: jogatina.id,
          player_id: ps.playerId,
          status: ps.status,
          notes: ps.notes.trim() || null,
        })),
      );

    if (playersError) {
      console.error("[v0] Error adding players:", playersError);
      alert("Erro ao adicionar jogadores");
    } else {
      setDate("");
      setNotes("");
      setPlayerStatuses([]);
      setSessionType("group");
      setOpen(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Jogatina
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Jogatina</DialogTitle>
            <DialogDescription>
              Registre uma sessão de jogo com seus amigos
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session-type">Tipo de Sessão *</Label>
              <Select
                value={sessionType}
                onValueChange={(value: "solo" | "group") =>
                  setSessionType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo (1 jogador)</SelectItem>
                  <SelectItem value="group">Grupo (2+ jogadores)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Data e Hora *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Sessão épica, construímos uma cidade inteira!"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Jogadores *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPlayerStatus}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Jogador
                </Button>
              </div>

              {playerStatuses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum jogador adicionado. Clique em "Adicionar Jogador" para
                  começar.
                </p>
              )}

              <div className="space-y-3">
                {playerStatuses.map((ps, index) => {
                  const selectedPlayer = players.find(
                    (p) => p.id === ps.playerId,
                  );
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="grid gap-2">
                            <Label>Jogador</Label>
                            <Select
                              value={ps.playerId}
                              onValueChange={(value) =>
                                updatePlayerStatus(index, "playerId", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um jogador">
                                  {selectedPlayer && (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            selectedPlayer.avatar_url ||
                                            undefined
                                          }
                                        />
                                        <AvatarFallback className="text-xs">
                                          {selectedPlayer.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{selectedPlayer.name}</span>
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {players.map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={player.avatar_url || undefined}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {player.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{player.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select
                              value={ps.status}
                              onValueChange={(value) =>
                                updatePlayerStatus(index, "status", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dropo">Dropo</SelectItem>
                                <SelectItem value="Zero">Zero</SelectItem>
                                <SelectItem value="Dava pra jogar">
                                  Dava pra jogar
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
                                  index,
                                  "notes",
                                  e.target.value,
                                )
                              }
                              placeholder="Ex: Parou porque o Heizmen dropou"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayerStatus(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Jogatina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
