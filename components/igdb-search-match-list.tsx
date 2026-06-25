"use client";

import { useEffect, useMemo, useState } from "react";
import type { IgdbSearchMatch } from "@/lib/igdb/types";
import {
  filterIgdbSearchMatches,
  getAvailableYears,
  hasMatchesWithoutYear,
  sortIgdbSearchMatches,
  type IgdbYearFilter,
} from "@/lib/igdb/filter-search-matches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface IgdbSearchMatchListProps {
  matches: IgdbSearchMatch[];
  onSelect: (match: IgdbSearchMatch) => void;
  isApplying?: boolean;
  referenceTitle?: string;
  emptyMessage?: string;
  filteredEmptyMessage?: string;
}

function IgdbSearchMatchCard({
  match,
  onSelect,
  isApplying,
}: {
  match: IgdbSearchMatch;
  onSelect: (match: IgdbSearchMatch) => void;
  isApplying: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-3 items-start">
      <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0">
        {match.coverUrl ? (
          <img
            src={match.coverUrl}
            alt={match.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center px-1">
            Sem capa
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">{match.name}</p>
            {match.year ? (
              <p className="text-sm text-muted-foreground">{match.year}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Ano desconhecido</p>
            )}
          </div>
          <Button
            size="sm"
            className="shrink-0"
            disabled={isApplying}
            onClick={() => onSelect(match)}
          >
            {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Usar este"}
          </Button>
        </div>
        {match.summary && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {match.summary}
          </p>
        )}
      </div>
    </div>
  );
}

export function IgdbSearchMatchList({
  matches,
  onSelect,
  isApplying = false,
  referenceTitle,
  emptyMessage = "Nenhum resultado para exibir. Tente outro termo de busca.",
  filteredEmptyMessage = "Nenhum resultado com os filtros atuais. Ajuste o ano ou o nome.",
}: IgdbSearchMatchListProps) {
  const [yearFilter, setYearFilter] = useState<IgdbYearFilter>("all");
  const [nameQuery, setNameQuery] = useState("");

  useEffect(() => {
    setYearFilter("all");
    setNameQuery("");
  }, [matches]);

  const availableYears = useMemo(() => getAvailableYears(matches), [matches]);
  const showUnknownYear = useMemo(() => hasMatchesWithoutYear(matches), [matches]);

  const filteredMatches = useMemo(
    () =>
      sortIgdbSearchMatches(
        filterIgdbSearchMatches(matches, {
          year: yearFilter,
          nameQuery,
        }),
        {
          nameQuery,
          referenceTitle,
        },
      ),
    [matches, yearFilter, nameQuery, referenceTitle],
  );

  const hasActiveFilters = yearFilter !== "all" || nameQuery.trim().length > 0;

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 space-y-3">
        <p className="text-xs text-muted-foreground">
          Filtros locais — refinam apenas os resultados já carregados, sem nova busca no IGDB.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={nameQuery}
            onChange={(event) => setNameQuery(event.target.value)}
            placeholder="Filtrar por nome (local)..."
            className="h-9 sm:flex-1"
            aria-label="Filtrar por nome localmente"
          />
          <Select
            value={String(yearFilter)}
            onValueChange={(value) => {
              if (value === "all" || value === "unknown") {
                setYearFilter(value);
                return;
              }

              setYearFilter(Number(value));
            }}
          >
            <SelectTrigger
              className="h-9 w-full sm:w-[200px]"
              aria-label="Filtrar por ano localmente"
            >
              <SelectValue placeholder="Ano (local)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
              {showUnknownYear && (
                <SelectItem value="unknown">Sem ano</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? `${filteredMatches.length} de ${matches.length} resultados`
            : matches.length === 1
              ? "1 resultado — escolha o jogo correto:"
              : `${matches.length} resultados — escolha o jogo correto:`}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-3 pb-1">
          {filteredMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {filteredEmptyMessage}
            </p>
          ) : (
            filteredMatches.map((match) => (
              <IgdbSearchMatchCard
                key={match.igdbId}
                match={match}
                onSelect={onSelect}
                isApplying={isApplying}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
