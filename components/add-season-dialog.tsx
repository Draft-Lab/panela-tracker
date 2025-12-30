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
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Player, Game } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface AddSeasonDialogProps {
  players: Player[];
  games: Game[];
}

export function AddSeasonDialog({ players, games }: AddSeasonDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gameId, setGameId] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const selectAllPlayers = () => {
    setSelectedPlayers(players.map((p) => p.id));
  };

  const clearPlayers = () => {
    setSelectedPlayers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameId || selectedPlayers.length === 0) {
      alert("Selecione um jogo e pelo menos um jogador!");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // Gerar nome padrão se não fornecido
      const seasonName =
        name.trim() || `Temporada ${new Date().toLocaleDateString("pt-BR")}`;

      // 1. Criar temporada (data de início = agora)
      const { data: season, error: seasonError } = await supabase
        .from("seasons")
        .insert({
          game_id: gameId,
          name: seasonName,
          description: description.trim() || null,
          started_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (seasonError) throw seasonError;

      // 2. Adicionar participantes
      const participants = selectedPlayers.map((playerId) => ({
        season_id: season.id,
        player_id: playerId,
        status: "Em andamento" as const,
      }));

      const { error: participantsError } = await supabase
        .from("season_participants")
        .insert(participants);

      if (participantsError) throw participantsError;

      // 3. Associar jogatinas ativas existentes deste jogo
      await supabase
        .from("jogatinas")
        .update({ season_id: season.id })
        .eq("game_id", gameId)
        .eq("is_current", true)
        .is("season_id", null);

      // Reset form
      setName("");
      setDescription("");
      setGameId("");
      setSelectedPlayers([]);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[v0] Error creating season:", error);
      alert("Erro ao criar temporada. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Temporada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Temporada</DialogTitle>
            <DialogDescription>
              Crie um compromisso social de longo prazo para acompanhar o
              progresso do grupo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="game">Jogo *</Label>
              <Select value={gameId} onValueChange={setGameId} required>
                <SelectTrigger>
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
              <p className="text-xs text-muted-foreground">
                Apenas uma temporada ativa por jogo
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Temporada (opcional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Primeira Temporada, Temporada de Verão"
              />
              <p className="text-xs text-muted-foreground">
                Se não informado, será gerado automaticamente
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Nossa primeira tentativa de zerar o jogo juntos!"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>
                  Participantes * ({selectedPlayers.length} selecionado
                  {selectedPlayers.length !== 1 ? "s" : ""})
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllPlayers}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearPlayers}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {players.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum jogador cadastrado. Cadastre jogadores primeiro!
                </p>
              )}

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
                      {player.discord_id && (
                        <span className="text-xs text-muted-foreground">
                          {player.discord_id}
                        </span>
                      )}
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
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Temporada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
