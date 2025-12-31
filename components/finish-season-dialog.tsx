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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users } from "lucide-react";
import { SeasonWithDetails } from "@/lib/types";

interface FinishSeasonDialogProps {
  season: SeasonWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParticipantStatus {
  id: string;
  status: "Dropo" | "Zero" | "Dava pra jogar";
  notes: string;
}

export function FinishSeasonDialog({
  season,
  open,
  onOpenChange,
}: FinishSeasonDialogProps) {
  const [participantStatuses, setParticipantStatuses] = useState<
    ParticipantStatus[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && season.season_participants) {
      setParticipantStatuses(
        season.season_participants.map((sp) => ({
          id: sp.id,
          status: (sp.status === "Em andamento" ? "Dava pra jogar" : sp.status) as "Dropo" | "Zero" | "Dava pra jogar",
          notes: sp.notes || "",
        })),
      );
    }
  }, [open, season]);

  const updateParticipantStatus = (
    id: string,
    field: "status" | "notes",
    value: string,
  ) => {
    setParticipantStatuses((prev) =>
      prev.map((ps) => (ps.id === id ? { ...ps, [field]: value } : ps)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    try {
      // 1. Atualizar status de cada participante
      for (const ps of participantStatuses) {
        await supabase
          .from("season_participants")
          .update({
            status: ps.status,
            notes: ps.notes.trim() || null,
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", ps.id);
      }

      // 2. Marcar temporada como finalizada
      await supabase
        .from("seasons")
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq("id", season.id);

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("[v0] Error finishing season:", error);
      alert("Erro ao finalizar temporada. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalSessions = season.season_participants?.reduce(
    (sum: number, p) => sum + (p.total_sessions || 0),
    0,
  );
  const totalHours = Math.floor(
    (season.season_participants?.reduce(
      (sum: number, p) => sum + (p.total_duration_minutes || 0),
      0,
    ) || 0) / 60,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Finalizar Temporada</DialogTitle>
            <DialogDescription>
              Defina o status final de cada participante e finalize a temporada{" "}
              <strong>{season.name}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* Resumo da Temporada */}
          <div className="bg-muted rounded-lg p-4 my-4">
            <h3 className="font-semibold mb-3">Resumo da Temporada</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-2xl font-bold">
                  {season.season_participants?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">participantes</p>
              </div>
              <div>
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold">{totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground">sessões totais</p>
              </div>
              <div>
                <Clock className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <div className="text-2xl font-bold">{totalHours}h</div>
                <p className="text-xs text-muted-foreground">jogadas</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 py-4">
            {season.season_participants?.map((sp) => {
              const ps = participantStatuses.find((p) => p.id === sp.id);
              if (!ps) return null;

              return (
                <div
                  key={sp.id}
                  className="p-4 border rounded-lg space-y-3 bg-card"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sp.player?.avatar_url || undefined} />
                      <AvatarFallback className="text-sm">
                        {sp.player?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{sp.player?.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{sp.total_sessions || 0} sessões</span>
                        <span>•</span>
                        <span>
                          {Math.floor((sp.total_duration_minutes || 0) / 60)}h
                          jogadas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Status Final *</Label>
                    <Select
                      value={ps.status}
                      onValueChange={(value) =>
                        updateParticipantStatus(sp.id, "status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dropo">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-red-500 border-red-500"
                            >
                              Dropo
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Abandonou a temporada
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Zero">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-green-500 border-green-500"
                            >
                              Zero
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Zerou o jogo
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Dava pra jogar">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-yellow-500 border-yellow-500"
                            >
                              Dava pra jogar
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Poderia continuar
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Observações (opcional)</Label>
                    <Input
                      value={ps.notes}
                      onChange={(e) =>
                        updateParticipantStatus(sp.id, "notes", e.target.value)
                      }
                      placeholder="Ex: Dropou na metade por falta de tempo"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Atenção:</strong> Ao finalizar a temporada, ela será
              marcada como inativa e não poderá receber mais sessões
              automaticamente. Os status definidos aqui serão permanentes.
            </p>
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
              {isLoading ? "Finalizando..." : "Finalizar Temporada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
