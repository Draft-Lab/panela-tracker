"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deactivateOrphanedPlayersAction,
  finalizeStuckSessionsAction,
} from "@/lib/live-state-audit-actions";
import { Loader2, Wrench } from "lucide-react";

interface PlaytimeAuditLiveStateFixActionsProps {
  orphanedPlayers: number;
  stuckSessions: number;
}

type FixAction = "orphans" | "sessions" | null;

export function PlaytimeAuditLiveStateFixActions({
  orphanedPlayers,
  stuckSessions,
}: PlaytimeAuditLiveStateFixActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<FixAction>(null);
  const [confirmAction, setConfirmAction] = useState<FixAction>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!orphanedPlayers && !stuckSessions) {
    return null;
  }

  function handleConfirm() {
    if (!confirmAction) {
      return;
    }

    setError(null);
    setFeedback(null);
    setPendingAction(confirmAction);
    setConfirmAction(null);

    startTransition(async () => {
      const result =
        confirmAction === "orphans"
          ? await deactivateOrphanedPlayersAction()
          : await finalizeStuckSessionsAction();

      setPendingAction(null);

      if (!result.success) {
        setError(result.error ?? "Não foi possível aplicar o ajuste.");
        return;
      }

      if (confirmAction === "orphans") {
        setFeedback(
          `${result.deactivatedPlayers ?? 0} jogador(es) órfão(s) desativado(s).`,
        );
      } else {
        setFeedback(
          `${result.finalizedSessions ?? 0} sessão(ões) presa(s) finalizada(s).`,
        );
      }

      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {orphanedPlayers > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => setConfirmAction("orphans")}
          >
            {pendingAction === "orphans" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wrench className="mr-1.5 h-3.5 w-3.5" />
            )}
            Desativar {orphanedPlayers} órfão(s)
          </Button>
        )}

        {stuckSessions > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => setConfirmAction("sessions")}
          >
            {pendingAction === "sessions" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wrench className="mr-1.5 h-3.5 w-3.5" />
            )}
            Finalizar {stuckSessions} sessão(ões) presa(s)
          </Button>
        )}
      </div>

      {feedback && (
        <p className="text-sm text-emerald-400">{feedback}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "orphans"
                ? "Desativar jogadores órfãos"
                : "Finalizar sessões presas"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "orphans" ? (
                <>
                  Isso marca <strong>{orphanedPlayers}</strong> jogador(es) como
                  inativo(s) em sessões já finalizadas. Não altera horas já
                  contabilizadas.
                </>
              ) : (
                <>
                  Isso finaliza <strong>{stuckSessions}</strong> sessão(ões) sem
                  evento recente ou vazia(s), desativa os jogadores e recalcula
                  a duração com base nos eventos.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Confirmar ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
