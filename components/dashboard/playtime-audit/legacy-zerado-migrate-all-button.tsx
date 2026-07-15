"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { migrateLegacyZeradoAction } from "@/lib/legacy-zerados-audit-actions";
import { Loader2, Plus } from "lucide-react";

interface PendingPlayer {
  playerId: string;
  playerName: string;
}

interface LegacyZeradoMigrateAllButtonProps {
  gameId: string;
  gameTitle: string;
  pendingPlayers: PendingPlayer[];
}

export function LegacyZeradoMigrateAllButton({
  gameId,
  gameTitle,
  pendingPlayers,
}: LegacyZeradoMigrateAllButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cleared, setCleared] = useState(false);

  if (cleared || pendingPlayers.length === 0) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      className="h-8 shrink-0 rounded-md"
      onClick={() => {
        startTransition(async () => {
          let ok = 0;
          let failed = 0;

          for (const player of pendingPlayers) {
            const result = await migrateLegacyZeradoAction(
              player.playerId,
              gameId,
            );
            if (result.success) ok += 1;
            else failed += 1;
          }

          if (ok > 0) {
            setCleared(true);
            toast.success(
              `${ok} jogador${ok === 1 ? "" : "es"} · ${gameTitle}`,
            );
          }
          if (failed > 0) {
            toast.error(
              `${failed} falha${failed === 1 ? "" : "s"} ao adicionar ${gameTitle}`,
            );
          }

          router.refresh();
        });
      }}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
          Adicionar pendentes ({pendingPlayers.length})
        </>
      )}
    </Button>
  );
}
