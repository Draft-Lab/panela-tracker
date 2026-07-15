"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { migrateLegacyZeradoAction } from "@/lib/legacy-zerados-audit-actions";
import type { LegacyZeradoMigrationStatus } from "@/lib/legacy-zerados-audit";
import { Loader2, Plus } from "lucide-react";

interface LegacyZeradoMigrateButtonProps {
  playerId: string;
  gameId: string;
  playerName: string;
  gameTitle: string;
  migrationStatus: LegacyZeradoMigrationStatus;
}

export function LegacyZeradoMigrateButton({
  playerId,
  gameId,
  playerName,
  gameTitle,
  migrationStatus,
}: LegacyZeradoMigrateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(migrationStatus === "ja_migrado");

  if (migrationStatus === "bloqueado_platinagem") {
    return (
      <span className="text-xs text-muted-foreground">Indisponível</span>
    );
  }

  if (done || migrationStatus === "ja_migrado") {
    return (
      <span className="text-xs text-emerald-400/90">Na lista</span>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      className="h-8 rounded-md px-2.5"
      onClick={() => {
        startTransition(async () => {
          const result = await migrateLegacyZeradoAction(playerId, gameId);
          if (!result.success) {
            toast.error(result.error ?? "Não foi possível adicionar.");
            return;
          }
          setDone(true);
          toast.success(`${gameTitle} adicionado a ${playerName}`);
          router.refresh();
        });
      }}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
          Adicionar
        </>
      )}
    </Button>
  );
}
