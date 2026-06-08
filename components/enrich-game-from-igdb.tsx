"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import type { IgdbSearchMatch } from "@/lib/igdb/types";
import {
  enrichGameWithIgdb,
  resolveAutoIgdbMatch,
  searchIgdbMatches,
} from "@/lib/igdb/enrich-game-flow";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IgdbGamePickerDialog } from "@/components/igdb-game-picker-dialog";

interface EnrichGameFromIgdbProps {
  game: Game;
}

export function EnrichGameFromIgdb({ game }: EnrichGameFromIgdbProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [matches, setMatches] = useState<IgdbSearchMatch[]>([]);

  const isDisabled =
    game.is_app || Boolean(game.igdb_synced_at) || isLoading;

  const enrichGame = async (igdbId: number, gameName: string) => {
    await enrichGameWithIgdb(game.id, igdbId);
    toast.success(`Informações de "${gameName}" atualizadas via IGDB`);
    setPickerOpen(false);
    router.refresh();
  };

  const handleSelectMatch = async (match: IgdbSearchMatch) => {
    setIsLoading(true);
    try {
      await enrichGame(match.igdbId, match.name);
    } catch (error) {
      console.error("Erro ao enriquecer jogo:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao enriquecer jogo",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchIgdbMatches(game.title);

      if (results.length === 0) {
        toast.error("Nenhum jogo encontrado no IGDB para este título");
        return;
      }

      const autoMatch = resolveAutoIgdbMatch(game.title, results);

      if (autoMatch) {
        await enrichGame(autoMatch.igdbId, autoMatch.name);
        return;
      }

      setMatches(results);
      setPickerOpen(true);
    } catch (error) {
      console.error("Erro ao buscar no IGDB:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao buscar no IGDB",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={handleSearch}
        title={
          game.is_app
            ? "Apps não são enriquecidos via IGDB"
            : game.igdb_synced_at
              ? "Jogo já enriquecido via IGDB"
              : "Buscar informações no IGDB"
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
      </Button>

      <IgdbGamePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        matches={matches}
        onSelect={handleSelectMatch}
        isApplying={isLoading}
      />
    </>
  );
}
