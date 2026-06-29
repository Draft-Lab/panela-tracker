"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell";
import { glassInner, glassOuter, glassSubtle } from "@/lib/glass-styles";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GamePickerFieldProps {
  games: Game[];
  value: string;
  onChange: (gameId: string) => void;
  excludeGameIds?: string[];
  label?: string;
  placeholder?: string;
}

export function GamePickerField({
  games,
  value,
  onChange,
  excludeGameIds = [],
  label = "Jogo",
  placeholder = "Buscar jogo...",
}: GamePickerFieldProps) {
  const [search, setSearch] = useState("");

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return games
      .filter((game) => !excludeGameIds.includes(game.id))
      .filter((game) =>
        query ? game.title.toLowerCase().includes(query) : true,
      )
      .slice(0, 50);
  }, [games, excludeGameIds, search]);

  const selectedGame = games.find((game) => game.id === value);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>

      {selectedGame && (
        <div
          className={cn(
            glassSubtle,
            "flex items-center gap-3 p-3 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          )}
        >
          <LandingCoverThumb
            src={selectedGame.cover_url}
            alt={selectedGame.title}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedGame.title}</p>
            <p className="text-xs text-muted-foreground">Selecionado</p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      <div className={cn(glassOuter, "max-h-48 overflow-y-auto")}>
        <div className={cn(glassInner, "divide-y divide-white/[0.06] p-0")}>
          {filteredGames.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum jogo encontrado
            </p>
          ) : (
            filteredGames.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => onChange(game.id)}
                className={cn(
                  "flex w-full items-center gap-3 p-3 text-left transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.04]",
                  value === game.id && "bg-white/[0.06]",
                )}
              >
                <LandingCoverThumb
                  src={game.cover_url}
                  alt={game.title}
                  size="sm"
                />
                <span className="truncate text-sm font-medium">{game.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
