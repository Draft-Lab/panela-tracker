"use client";

import { useState } from "react";
import type { IgdbSearchMatch } from "@/lib/igdb/types";
import type { IgdbReviewItem } from "@/lib/igdb/bulk-enrich-types";
import { suggestIgdbSearchQuery } from "@/lib/igdb/normalize-title";
import {
  enrichGameWithIgdb,
  searchIgdbMatches,
} from "@/lib/igdb/enrich-game-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IgdbGamePickerDialog } from "@/components/igdb-game-picker-dialog";
import { List, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface IgdbBulkReviewPanelProps {
  items: IgdbReviewItem[];
  onResolved: (gameId: string, igdbName: string) => void;
}

const reasonLabels: Record<IgdbReviewItem["reason"], string> = {
  not_found: "Sem resultado",
  ambiguous: "Ambíguo",
  error: "Erro",
  pending: "Pendente",
};

function ReviewItemRow({
  item,
  onResolved,
}: {
  item: IgdbReviewItem;
  onResolved: (gameId: string, igdbName: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState(
    item.searchQuery || suggestIgdbSearchQuery(item.title),
  );
  const [matches, setMatches] = useState<IgdbSearchMatch[]>(item.matches ?? []);
  const [isSearching, setIsSearching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um termo para buscar");
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchIgdbMatches(searchQuery.trim());
      setMatches(results);

      if (results.length === 0) {
        toast.error("Nenhum resultado encontrado");
        return;
      }

      if (results.length === 1) {
        await applyMatch(results[0]);
        return;
      }

      setPickerOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao buscar no IGDB",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const applyMatch = async (match: IgdbSearchMatch) => {
    setIsApplying(true);
    try {
      await enrichGameWithIgdb(item.gameId, match.igdbId);
      toast.success(`"${item.title}" enriquecido como "${match.name}"`);
      setPickerOpen(false);
      onResolved(item.gameId, match.name);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao enriquecer jogo",
      );
    } finally {
      setIsApplying(false);
    }
  };

  const openCachedMatches = () => {
    if (matches.length === 0) {
      void handleSearch();
      return;
    }
    setPickerOpen(true);
  };

  return (
    <>
      <article className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {reasonLabels[item.reason]}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Termo de busca no IGDB"
            className="h-9"
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleSearch();
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            disabled={isSearching || isApplying}
            onClick={() => void handleSearch()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(item.reason === "ambiguous" || matches.length > 1) && (
            <Button
              size="sm"
              variant="outline"
              disabled={isSearching || isApplying}
              onClick={openCachedMatches}
            >
              <List className="h-4 w-4 mr-2" />
              Escolher{matches.length > 0 ? ` (${matches.length})` : ""}
            </Button>
          )}
          {searchQuery !== suggestIgdbSearchQuery(item.title) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() =>
                setSearchQuery(suggestIgdbSearchQuery(item.title))
              }
            >
              Restaurar nome sugerido
            </Button>
          )}
        </div>
      </article>

      <IgdbGamePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        matches={matches}
        onSelect={(match) => void applyMatch(match)}
        isApplying={isApplying}
        referenceTitle={item.title}
        title={`Escolher jogo para "${item.title}"`}
        description="Selecione a correspondência correta no IGDB ou feche e ajuste o termo de busca."
      />
    </>
  );
}

export function IgdbBulkReviewPanel({
  items,
  onResolved,
}: IgdbBulkReviewPanelProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum jogo pendente de revisão.
      </p>
    );
  }

  return (
    <div className="space-y-3 pb-2">
      {items.map((item) => (
        <ReviewItemRow key={item.gameId} item={item} onResolved={onResolved} />
      ))}
    </div>
  );
}
