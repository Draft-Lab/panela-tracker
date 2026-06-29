"use client";

import { useState } from "react";
import { Plus, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GamePickerField } from "@/components/edit-player/game-picker-field";
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell";
import {
  addPlatinado,
  getPlatinumErrorMessage,
  markAsPlatinado,
  removePlatinumEntry,
} from "@/lib/player-platinum-mutations";
import { getGameCover, getGameTitle } from "@/lib/player-platinum-helpers";
import { glassInner, glassOuter, glassSubtle } from "@/lib/glass-styles";
import type { Game, PlayerPlatinumGame } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EditPlayerPlatinadosSectionProps {
  playerId: string;
  platinados: PlayerPlatinumGame[];
  platinando: PlayerPlatinumGame | null;
  games: Game[];
  onUpdated: () => void;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </span>
  );
}

function formatCompletedDate(date: string | null): string {
  if (!date) return "Data não informada";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function EditPlayerPlatinadosSection({
  playerId,
  platinados,
  platinando,
  games,
  onUpdated,
}: EditPlayerPlatinadosSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const usedGameIds = [
    ...platinados.map((entry) => entry.game_id),
    ...(platinando ? [platinando.game_id] : []),
  ];

  const handleAdd = async () => {
    if (!selectedGameId) {
      toast.error("Selecione um jogo");
      return;
    }

    if (platinando?.game_id === selectedGameId) {
      setIsLoading(true);
      try {
        await markAsPlatinado(platinando.id);
        toast.success("Jogo marcado como platinado");
        setSelectedGameId("");
        setIsAdding(false);
        onUpdated();
      } catch (error) {
        toast.error(getPlatinumErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      await addPlatinado(playerId, selectedGameId);
      toast.success("Jogo platinado adicionado");
      setSelectedGameId("");
      setIsAdding(false);
      onUpdated();
    } catch (error) {
      toast.error(getPlatinumErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    if (!confirm("Remover este jogo da lista de platinados?")) return;

    setIsLoading(true);
    try {
      await removePlatinumEntry(entryId);
      toast.success("Jogo removido");
      onUpdated();
    } catch (error) {
      toast.error(getPlatinumErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(glassOuter)}>
      <div className={cn(glassInner, "p-4 sm:p-5")}>
        <SectionEyebrow>Platinados</SectionEyebrow>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" strokeWidth={1.75} />
            <h3 className="text-base font-semibold tracking-tight">
              Jogos platinados
            </h3>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-muted-foreground">
              {platinados.length}
            </span>
          </div>
          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="rounded-full"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              Adicionar
            </Button>
          )}
        </div>

        {isAdding && (
          <div className="mt-4 space-y-4">
            {platinando && (
              <p className="text-xs text-muted-foreground">
                Se selecionar o jogo em platinagem atual, ele será marcado como
                platinado automaticamente.
              </p>
            )}
            <GamePickerField
              games={games}
              value={selectedGameId}
              onChange={setSelectedGameId}
              excludeGameIds={usedGameIds.filter(
                (id) => id !== platinando?.game_id,
              )}
              label="Selecionar jogo platinado"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isLoading || !selectedGameId}
                className="rounded-full"
              >
                {isLoading ? "Salvando..." : "Confirmar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedGameId("");
                }}
                className="rounded-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {platinados.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum jogo platinado ainda
            </p>
          ) : (
            platinados.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  glassSubtle,
                  "flex items-center gap-3 p-3 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                )}
              >
                <LandingCoverThumb
                  src={getGameCover(entry)}
                  alt={getGameTitle(entry)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {getGameTitle(entry)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCompletedDate(entry.completed_at)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(entry.id)}
                  disabled={isLoading}
                  className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
