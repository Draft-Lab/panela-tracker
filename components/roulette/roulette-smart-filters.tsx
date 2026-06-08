"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RecentExcludeDays,
  RouletteSmartFilters,
  UnderplayedMode,
} from "@/lib/roulette/types";
import { cn } from "@/lib/utils";

interface RouletteSmartFiltersPanelProps {
  filters: RouletteSmartFilters;
  genres: string[];
  poolSize: number;
  onChange: (filters: RouletteSmartFilters) => void;
  className?: string;
  footerMessage?: string | null;
}

export function RouletteSmartFiltersPanel({
  filters,
  genres,
  poolSize,
  onChange,
  className,
  footerMessage,
}: RouletteSmartFiltersPanelProps) {
  const toggleGenre = (genre: string) => {
    const selected = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter((item) => item !== genre)
      : [...filters.selectedGenres, genre];

    onChange({ ...filters, selectedGenres: selected });
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-[340px] min-w-0 flex-col rounded-xl border border-border/50 bg-card/30 p-4",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Filtros inteligentes</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Refine o pool antes de girar
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums shrink-0">
          {poolSize} no pool
        </Badge>
      </div>

      {genres.length > 0 ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col space-y-2">
          <p className="shrink-0 text-xs font-medium text-muted-foreground">Gêneros</p>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
            <div className="flex flex-wrap gap-1.5">
              {genres.map((genre) => {
                const active = filters.selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {genre}
                  </button>
                );
              })}
              {filters.selectedGenres.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, selectedGenres: [] })}
                  className="shrink-0 rounded-full border border-dashed border-border/60 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0" aria-hidden />
      )}

      <div className="mt-4 shrink-0 space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="exclude-recent"
            checked={filters.excludeRecent}
            onCheckedChange={(checked) =>
              onChange({ ...filters, excludeRecent: checked === true })
            }
          />
          <div className="space-y-2">
            <Label htmlFor="exclude-recent" className="text-sm font-normal cursor-pointer">
              Excluir jogados recentemente em grupo
            </Label>
            {filters.excludeRecent && (
              <Select
                value={String(filters.recentDays)}
                onValueChange={(value) =>
                  onChange({
                    ...filters,
                    recentDays: Number(value) as RecentExcludeDays,
                  })
                }
              >
                <SelectTrigger size="sm" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="14">Últimos 14 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="prioritize-underplayed"
            checked={filters.prioritizeUnderplayed}
            onCheckedChange={(checked) =>
              onChange({ ...filters, prioritizeUnderplayed: checked === true })
            }
          />
          <div className="space-y-2">
            <Label
              htmlFor="prioritize-underplayed"
              className="text-sm font-normal cursor-pointer"
            >
              Priorizar menos jogados em grupo
            </Label>
            {filters.prioritizeUnderplayed && (
              <div className="flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
                {(
                  [
                    { value: "weighted", label: "Por peso" },
                    { value: "bottom_half", label: "Só os menos jogados" },
                  ] as { value: UnderplayedMode; label: string }[]
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onChange({ ...filters, underplayedMode: value })}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      filters.underplayedMode === value
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {footerMessage && (
        <p className="mt-3 shrink-0 text-xs text-muted-foreground rounded-lg border border-dashed border-border/60 px-3 py-2">
          {footerMessage}
        </p>
      )}
    </div>
  );
}
