"use client";

import type { IgdbSearchMatch } from "@/lib/igdb/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IgdbGamePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: IgdbSearchMatch[];
  onSelect: (match: IgdbSearchMatch) => void;
  isApplying?: boolean;
  title?: string;
  description?: string;
}

export function IgdbGamePickerDialog({
  open,
  onOpenChange,
  matches,
  onSelect,
  isApplying = false,
  title = "Selecione o jogo correto",
  description = "Encontramos mais de uma correspondência no IGDB. Escolha a opção correta.",
}: IgdbGamePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto space-y-3 pr-1">
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum resultado para exibir. Tente outro termo de busca.
            </p>
          ) : (
            matches.map((match) => (
              <div
                key={match.igdbId}
                className="flex gap-3 rounded-lg border p-3 items-start"
              >
                <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0">
                  {match.coverUrl ? (
                    <img
                      src={match.coverUrl}
                      alt={match.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      Sem capa
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{match.name}</p>
                      {match.year && (
                        <p className="text-sm text-muted-foreground">
                          {match.year}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={isApplying}
                      onClick={() => onSelect(match)}
                    >
                      Usar este
                    </Button>
                  </div>
                  {match.summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {match.summary}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
