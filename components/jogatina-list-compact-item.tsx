"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JogatinaListPlayers } from "@/components/jogatina-list-players";
import { formatJogatinaDate } from "@/lib/jogatina-display-helpers";
import type { JogatinaWithDetails } from "@/lib/types";

interface JogatinaListCompactItemProps {
  jogatina: JogatinaWithDetails;
  hideGameTitle?: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function JogatinaListCompactItem({
  jogatina,
  hideGameTitle = false,
  canEdit,
  onEdit,
  onDelete,
}: JogatinaListCompactItemProps) {
  return (
    <article className="rounded-lg border border-border/40 bg-background/20 px-3 py-3 transition-colors hover:border-border/70 hover:bg-background/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {!hideGameTitle && (
            <p className="truncate text-sm font-medium">
              {jogatina.game?.title || "Jogo desconhecido"}
            </p>
          )}
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            {formatJogatinaDate(jogatina.date)}
          </p>
          {jogatina.notes && (
            <p className="line-clamp-2 text-xs italic text-muted-foreground">
              {jogatina.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          {canEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label="Editar jogatina"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDelete}
            aria-label="Excluir jogatina"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      <JogatinaListPlayers jogatina={jogatina} compact />
    </article>
  );
}
