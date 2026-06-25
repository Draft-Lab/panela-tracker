"use client";

import type { IgdbSearchMatch } from "@/lib/igdb/types";
import { IgdbSearchMatchList } from "@/components/igdb-search-match-list";
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
  referenceTitle?: string;
  title?: string;
  description?: string;
}

export function IgdbGamePickerDialog({
  open,
  onOpenChange,
  matches,
  onSelect,
  isApplying = false,
  referenceTitle,
  title = "Selecione o jogo correto",
  description = "Encontramos mais de uma correspondência no IGDB. Escolha a opção correta.",
}: IgdbGamePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <IgdbSearchMatchList
            matches={matches}
            onSelect={onSelect}
            isApplying={isApplying}
            referenceTitle={referenceTitle}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
