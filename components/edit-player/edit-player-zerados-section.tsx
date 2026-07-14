"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GamePickerField } from "@/components/edit-player/game-picker-field";
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell";
import {
  listEligibleSeasonZeradoGames,
  type EligibleSeasonZeradoGame,
  getZeradoGameCover,
  getZeradoGameTitle,
} from "@/lib/player-zerado-helpers";
import {
  addZerado,
  getZeradoErrorMessage,
  removeZeradoEntry,
} from "@/lib/player-zerado-mutations";
import { glassInner, glassOuter, glassSubtle } from "@/lib/glass-styles";
import type { Game, PlayerZeradoGame } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EditPlayerZeradosSectionProps {
  playerId: string;
  zerados: PlayerZeradoGame[];
  games: Game[];
  excludeGameIds: string[];
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

export function EditPlayerZeradosSection({
  playerId,
  zerados,
  games,
  excludeGameIds,
  onUpdated,
}: EditPlayerZeradosSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [seasonEligible, setSeasonEligible] = useState<
    EligibleSeasonZeradoGame[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    listEligibleSeasonZeradoGames(playerId)
      .then((list) => {
        if (!cancelled) setSeasonEligible(list);
      })
      .catch((error) => {
        console.error("[EditPlayerZerados] Error loading season zeros:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [playerId, zerados]);

  const usedGameIds = [
    ...excludeGameIds,
    ...zerados.map((entry) => entry.game_id),
  ];

  const handleAdd = async () => {
    if (!selectedGameId) {
      toast.error("Selecione um jogo");
      return;
    }

    setIsLoading(true);
    try {
      await addZerado(playerId, selectedGameId);
      toast.success("Jogo zerado adicionado");
      setSelectedGameId("");
      setIsAdding(false);
      onUpdated();
    } catch (error) {
      toast.error(getZeradoErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSeasonGame = async (gameId: string) => {
    setIsLoading(true);
    try {
      await addZerado(playerId, gameId);
      toast.success("Zerado de temporada adicionado");
      onUpdated();
    } catch (error) {
      toast.error(getZeradoErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    if (!confirm("Remover este jogo da lista de zerados?")) return;

    setIsLoading(true);
    try {
      await removeZeradoEntry(entryId);
      toast.success("Jogo removido");
      onUpdated();
    } catch (error) {
      toast.error(getZeradoErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(glassOuter)}>
      <div className={cn(glassInner, "p-4 sm:p-5")}>
        <SectionEyebrow>Zerados</SectionEyebrow>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-4 w-4 text-emerald-400"
              strokeWidth={1.75}
            />
            <h3 className="text-base font-semibold tracking-tight">
              Jogos zerados
            </h3>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-muted-foreground">
              {zerados.length}
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

        {seasonEligible.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Zerados de temporada
            </p>
            {seasonEligible.map((item) => (
              <div
                key={item.game_id}
                className={cn(
                  glassSubtle,
                  "flex items-center gap-3 p-3",
                )}
              >
                <LandingCoverThumb
                  src={item.game.cover_url}
                  alt={item.game.title}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.game.title}
                  </p>
                  {item.season_name && (
                    <p className="text-xs text-muted-foreground">
                      {item.season_name}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => handleAddSeasonGame(item.game_id)}
                  className="rounded-full shrink-0"
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="mt-4 space-y-4">
            <GamePickerField
              games={games}
              value={selectedGameId}
              onChange={setSelectedGameId}
              excludeGameIds={usedGameIds}
              label="Selecionar jogo zerado"
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
          {zerados.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum jogo zerado ainda
            </p>
          ) : (
            zerados.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  glassSubtle,
                  "flex items-center gap-3 p-3 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                )}
              >
                <LandingCoverThumb
                  src={getZeradoGameCover(entry)}
                  alt={getZeradoGameTitle(entry)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {getZeradoGameTitle(entry)}
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
