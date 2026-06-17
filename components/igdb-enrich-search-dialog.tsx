"use client";

import { useCallback, useEffect, useState } from "react";
import type { IgdbSearchMatch } from "@/lib/igdb/types";
import { suggestIgdbSearchQuery } from "@/lib/igdb/normalize-title";
import {
  enrichGameWithIgdb,
  searchIgdbMatches,
} from "@/lib/igdb/enrich-game-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

interface IgdbEnrichSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  gameTitle: string;
  onSuccess: (igdbName: string) => void;
}

export function IgdbEnrichSearchDialog({
  open,
  onOpenChange,
  gameId,
  gameTitle,
  onSuccess,
}: IgdbEnrichSearchDialogProps) {
  const suggestedQuery = suggestIgdbSearchQuery(gameTitle);
  const [searchQuery, setSearchQuery] = useState(suggestedQuery);
  const [matches, setMatches] = useState<IgdbSearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const applyMatch = useCallback(
    async (match: IgdbSearchMatch) => {
      setIsApplying(true);
      try {
        await enrichGameWithIgdb(gameId, match.igdbId);
        toast.success(`Informações de "${match.name}" atualizadas via IGDB`);
        onOpenChange(false);
        onSuccess(match.name);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao enriquecer jogo",
        );
      } finally {
        setIsApplying(false);
      }
    },
    [gameId, onOpenChange, onSuccess],
  );

  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        toast.error("Digite um termo para buscar");
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      try {
        const results = await searchIgdbMatches(trimmed);
        setMatches(results);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao buscar no IGDB",
        );
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    const query = suggestIgdbSearchQuery(gameTitle);
    setSearchQuery(query);
    setMatches([]);
    setHasSearched(false);
    void runSearch(query);
  }, [open, gameTitle, runSearch]);

  const showEmptyState = hasSearched && !isSearching && matches.length === 0;
  const showResults = hasSearched && !isSearching && matches.length > 0;
  const isBusy = isSearching || isApplying;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Buscar no IGDB</DialogTitle>
          <DialogDescription>
            Enriquecer <span className="font-medium text-foreground">{gameTitle}</span>{" "}
            com capa, descrição e metadados do IGDB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="igdb-search-query" className="text-sm font-medium">
            Termo de busca
          </label>
          <div className="flex gap-2">
            <Input
              id="igdb-search-query"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Ex.: EMPULSE"
              className="h-9"
              disabled={isBusy}
              onKeyDown={(event) => {
                if (event.key === "Enter") void runSearch(searchQuery);
              }}
            />
            <Button
              size="sm"
              className="shrink-0 h-9 px-3"
              disabled={isBusy}
              onClick={() => void runSearch(searchQuery)}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="sr-only">Buscar</span>
            </Button>
          </div>
          {searchQuery !== suggestedQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-0 py-0 text-xs text-muted-foreground hover:text-foreground"
              disabled={isBusy}
              onClick={() => setSearchQuery(suggestedQuery)}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Restaurar nome sugerido
            </Button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isSearching && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Buscando no IGDB...
            </div>
          )}

          {showEmptyState && (
            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center space-y-2">
              <p className="text-sm font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm text-muted-foreground">
                Não achamos jogos para &quot;{searchQuery.trim()}&quot;. Tente
                remover sufixos como &quot;Demo&quot;, usar o nome em inglês ou
                uma variação do título.
              </p>
            </div>
          )}

          {showResults && (
            <div className="space-y-3 pr-1">
              <p className="text-sm text-muted-foreground">
                {matches.length === 1
                  ? "1 resultado encontrado — confirme se é o jogo correto:"
                  : `${matches.length} resultados — escolha o jogo correto:`}
              </p>
              {matches.map((match) => (
                <div
                  key={match.igdbId}
                  className="flex gap-3 rounded-lg border p-3 items-start"
                >
                  <div className="w-14 h-[4.5rem] bg-muted rounded overflow-hidden shrink-0">
                    {match.coverUrl ? (
                      <img
                        src={match.coverUrl}
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center px-1">
                        Sem capa
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{match.name}</p>
                        {match.year && (
                          <p className="text-sm text-muted-foreground">
                            {match.year}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="shrink-0"
                        disabled={isBusy}
                        onClick={() => void applyMatch(match)}
                      >
                        {isApplying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Usar este"
                        )}
                      </Button>
                    </div>
                    {match.summary && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {match.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
