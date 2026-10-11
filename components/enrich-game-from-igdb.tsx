"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { IgdbEnrichSearchDialog } from "@/components/igdb-enrich-search-dialog";

interface EnrichGameFromIgdbProps {
  game: Game;
}

export function EnrichGameFromIgdb({ game }: EnrichGameFromIgdbProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const actionLabel = game.is_app
    ? "Apps não são enriquecidos via IGDB"
    : game.igdb_synced_at
      ? "Alterar informações do IGDB"
      : "Buscar informações no IGDB";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={game.is_app}
        onClick={() => setDialogOpen(true)}
        title={actionLabel}
        aria-label={actionLabel}
      >
        <Database className="h-4 w-4" />
      </Button>

      <IgdbEnrichSearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        gameId={game.id}
        gameTitle={game.title}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
