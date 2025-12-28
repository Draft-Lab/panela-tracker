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
import type { Player, Game } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface AddCurrentGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCurrentGameDialog({
  open,
  onOpenChange,
}: AddCurrentGameDialogProps) {
  const [gameId, setGameId] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionType, setSessionType] = useState<"solo" | "group">("group");
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const [playersRes, gamesRes] = await Promise.all([
        supabase.from("players").select("*").order("name", { ascending: true }),
        supabase.from("games").select("*").order("title", { ascending: true }),
      ]);

      if (playersRes.data) setPlayers(playersRes.data);
      if (gamesRes.data) setGames(gamesRes.data);
    };

    loadData();
  }, []);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || selectedPlayers.length === 0) {
      alert("Selecione um jogo e pelo menos um jogador!");
      return;
    }

    // Validar tipo de sessão
    if (sessionType === "solo" && selectedPlayers.length !== 1) {
      alert("Sessões solo devem ter exatamente um jogador!");
      return;
    }

    if (sessionType === "group" && selectedPlayers.length < 2) {
      alert("Sessões em grupo devem ter pelo menos dois jogadores!");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const now = new Date();

    // Create jogatina marked as current
    const { data: jogatina, error: jogatinaError } = await supabase
      .from("jogatinas")
      .insert({
        game_id: gameId,
        date: now.toISOString(),
        started_at: now.toISOString(),
        notes: notes.trim() || null,
        is_current: true,
        session_type: sessionType,
        source: "manual",
      })
      .select()
      .single();

    if (jogatinaError || !jogatina) {
      alert("Erro ao criar jogo atual");
      setIsLoading(false);
      return;
    }

    // Add all selected players with default "Dava pra jogar" status
    const { error: playersError } = await supabase
      .from("jogatina_players")
      .insert(
        selectedPlayers.map((playerId) => ({
          jogatina_id: jogatina.id,
          player_id: playerId,
          status: "Dava pra jogar" as const,
          notes: null,
        })),
      );

    if (playersError) {
      alert("Erro ao adicionar jogadores");
    } else {
      setGameId("");
      setNotes("");
      setSessionType("group");
      setSelectedPlayers([]);
      onOpenChange(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Iniciar Jogo Atual</DialogTitle>
            <DialogDescription>
              Marque um jogo que vocês estão jogando agora
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
              <p className="text-xs text-muted-foreground">
                {sessionType === "solo"
                  ? "Uma sessão individual - selecione exatamente 1 jogador"
                  : "Uma sessão em grupo - selecione 2 ou mais jogadores"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="game">Jogo *</Label>
              <Select value={gameId} onValueChange={setGameId}>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Começamos uma nova campanha!"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">
                Jogadores * ({selectedPlayers.length} selecionado
                {selectedPlayers.length !== 1 ? "s" : ""})
              </Label>
              {players.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum jogador cadastrado. Cadastre jogadores primeiro!
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="flex-1">
                      <span className="text-sm font-medium block">
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
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Iniciando..." : "Iniciar Jogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
