"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { RoulettePoolEntry } from "@/lib/roulette/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline";
import { cn } from "@/lib/utils";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { CheckCheck, Gamepad2, Search, X } from "lucide-react";

interface RouletteGamePoolProps {
  entries: RoulettePoolEntry[];
  selectedIds: Set<string>;
  onToggle: (gameId: string) => void;
  onSelectAll: (gameIds: string[]) => void;
  onClearVisible: (gameIds: string[]) => void;
}

export function RouletteGamePool({
  entries,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearVisible,
}: RouletteGamePoolProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const visibleEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return entries;

    return entries.filter(({ game }) =>
      game.title.toLowerCase().includes(query),
    );
  }, [entries, searchTerm]);

  const visibleIds = visibleEntries.map((entry) => entry.game.id);
  const selectedInPool = entries.filter((entry) =>
    selectedIds.has(entry.game.id),
  ).length;
  const selectedVisible = visibleEntries.filter((entry) =>
    selectedIds.has(entry.game.id),
  ).length;

  return (
    <DashboardPanel innerClassName="flex min-w-0 flex-col overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Pool de jogos</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedInPool} de {entries.length} selecionados
            {searchTerm.trim() && visibleEntries.length !== entries.length && (
              <> · {visibleEntries.length} na busca</>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(visibleIds)}
            disabled={visibleEntries.length === 0}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClearVisible(visibleIds)}
            disabled={selectedVisible === 0}
          >
            Limpar
          </Button>
        </div>
      </div>

      <div className="border-b border-border/50 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar jogo no pool..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[min(520px,60vh)] overflow-y-auto p-3 [scrollbar-width:thin]">
        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum jogo passou pelos filtros atuais.
          </p>
        ) : visibleEntries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum jogo encontrado para &quot;{searchTerm.trim()}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {visibleEntries.map(({ game, stats }) => {
              const selected = selectedIds.has(game.id);

              return (
                <label
                  key={game.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent/40",
                    selected
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60",
                  )}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggle(game.id)}
                  />

                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                    {game.cover_url ? (
                      <Image
                        src={game.cover_url}
                        alt={game.title}
                        fill
                        sizes="48px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{game.title}</p>
                    <GameIgdbMetaInline
                      game={game}
                      variant="line"
                      className="mt-0.5"
                    />
                  </div>

                  {stats.groupSessions > 0 && (
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] tabular-nums"
                    >
                      {stats.groupSessions} sess.
                    </Badge>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
