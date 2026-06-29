"use client";

import { useState } from "react";
import { Medal, Plus, RefreshCw, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell";
import { GamePickerField } from "@/components/edit-player/game-picker-field";
import {
  addPlatinando,
  getPlatinumErrorMessage,
  markAsPlatinado,
  removePlatinumEntry,
} from "@/lib/player-platinum-mutations";
import { getGameCover, getGameTitle } from "@/lib/player-platinum-helpers";
import { glassInner, glassOuter, glassSubtle } from "@/lib/glass-styles";
import type { Game, PlayerPlatinumGame } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EditPlayerPlatinandoSectionProps {
  playerId: string;
  platinando: PlayerPlatinumGame | null;
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

export function EditPlayerPlatinandoSection({
  playerId,
  platinando,
  games,
  excludeGameIds,
  onUpdated,
}: EditPlayerPlatinandoSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!selectedGameId) {
      toast.error("Selecione um jogo");
      return;
    }

    if (
      platinando &&
      !confirm(
        "Já existe um jogo em platinagem. Deseja substituir pelo novo jogo?",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await addPlatinando(playerId, selectedGameId, platinando?.id);
      toast.success(
        platinando ? "Jogo em platinagem atualizado" : "Jogo em platinagem adicionado",
      );
      setSelectedGameId("");
      setIsAdding(false);
      setIsSwapping(false);
      onUpdated();
    } catch (error) {
      toast.error(getPlatinumErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPlatinado = async () => {
    if (!platinando) return;

    setIsLoading(true);
    try {
      await markAsPlatinado(platinando.id);
      toast.success("Jogo marcado como platinado");
      onUpdated();
    } catch (error) {
      toast.error(getPlatinumErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!platinando) return;
    if (!confirm("Remover jogo em platinagem?")) return;

    setIsLoading(true);
    try {
      await removePlatinumEntry(platinando.id);
      toast.success("Platinagem removida");
      onUpdated();
    } catch (error) {
      toast.error(getPlatinumErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const showPicker = isAdding || isSwapping;

  return (
    <div className={cn(glassOuter)}>
      <div className={cn(glassInner, "p-4 sm:p-5")}>
        <SectionEyebrow>Em platinagem</SectionEyebrow>
        <div className="flex items-center gap-2">
          <Medal className="h-4 w-4 text-amber-400" strokeWidth={1.75} />
          <h3 className="text-base font-semibold tracking-tight">
            Jogo em platinagem
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Apenas um jogo ativo por vez
        </p>

        {platinando && !showPicker && (
          <div className={cn(glassSubtle, "mt-4 space-y-3 p-3")}>
            <div className="flex items-center gap-3">
              <LandingCoverThumb
                src={getGameCover(platinando)}
                alt={getGameTitle(platinando)}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{getGameTitle(platinando)}</p>
                <p className="text-xs text-amber-400/90">Em progresso</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
              <Button
                type="button"
                size="sm"
                onClick={handleMarkPlatinado}
                disabled={isLoading}
                className="rounded-full"
              >
                <Trophy className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Marcar platinado
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsSwapping(true)}
                disabled={isLoading}
                className="rounded-full"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Trocar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                disabled={isLoading}
                className="rounded-full text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                Remover
              </Button>
            </div>
          </div>
        )}

        {!platinando && !showPicker && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="mt-4 rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
            Adicionar jogo em platinagem
          </Button>
        )}

        {showPicker && (
          <div className="mt-4 space-y-4">
            <GamePickerField
              games={games}
              value={selectedGameId}
              onChange={setSelectedGameId}
              excludeGameIds={excludeGameIds.filter(
                (id) => id !== platinando?.game_id,
              )}
              label="Selecionar jogo"
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
                  setIsSwapping(false);
                  setSelectedGameId("");
                }}
                className="rounded-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
