"use client";

import { useMemo, useRef, useState } from "react";
import type { Game } from "@/lib/types";
import type { BulkResult } from "@/lib/igdb/bulk-enrich-types";
import { bulkResultToReviewItem } from "@/lib/igdb/bulk-enrich-types";
import { suggestIgdbSearchQuery } from "@/lib/igdb/normalize-title";
import {
  enrichGameWithIgdb,
  IGDB_BULK_DELAY_MS,
  resolveAutoIgdbMatch,
  searchIgdbMatches,
  sleep,
} from "@/lib/igdb/enrich-game-flow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IgdbBulkReviewPanel } from "@/components/igdb-bulk-review-panel";
import { Database, Loader2, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EnrichAllGamesIgdbProps {
  games: Game[];
}

type DialogTab = "progress" | "review";

function getEligibleGames(games: Game[]): Game[] {
  return games.filter((game) => !game.is_app && !game.igdb_synced_at);
}

function buildPendingReviewItems(games: Game[]): BulkResult[] {
  return getEligibleGames(games).map((game) => ({
    gameId: game.id,
    title: game.title,
    status: "skipped" as const,
    message: "Aguardando enriquecimento manual",
    skipReason: "pending" as const,
    searchQuery: suggestIgdbSearchQuery(game.title),
  }));
}

export function EnrichAllGamesIgdb({ games }: EnrichAllGamesIgdbProps) {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const eligibleGames = useMemo(() => getEligibleGames(games), [games]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DialogTab>("progress");
  const [isRunning, setIsRunning] = useState(false);
  const [batchTotal, setBatchTotal] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTitle, setCurrentTitle] = useState("");
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const processedCount = results.length;
  const progress =
    batchTotal > 0 ? Math.round((processedCount / batchTotal) * 100) : 0;

  const successCount = results.filter((r) => r.status === "success").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  const reviewItems = useMemo(() => {
    const fromBatch = results
      .filter(
        (result) =>
          (result.status === "skipped" || result.status === "error") &&
          !resolvedIds.has(result.gameId),
      )
      .map(bulkResultToReviewItem);

    if (fromBatch.length > 0) return fromBatch;

    return buildPendingReviewItems(games)
      .filter((item) => !resolvedIds.has(item.gameId))
      .map(bulkResultToReviewItem);
  }, [results, resolvedIds, games]);

  const resetRunState = () => {
    setCurrentIndex(0);
    setCurrentTitle("");
    setWaitingSeconds(0);
    setResults([]);
    setBatchTotal(0);
    setResolvedIds(new Set());
    setActiveTab("progress");
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const processGame = async (
    game: Game,
    signal: AbortSignal,
  ): Promise<BulkResult> => {
    try {
      const searchQuery = suggestIgdbSearchQuery(game.title);
      const matches = await searchIgdbMatches(searchQuery);
      const match = resolveAutoIgdbMatch(game.title, matches);

      if (!match) {
        if (matches.length === 0) {
          return {
            gameId: game.id,
            title: game.title,
            status: "skipped",
            skipReason: "not_found",
            message: "Nenhum resultado no IGDB",
            matches: [],
            searchQuery,
          };
        }

        return {
          gameId: game.id,
          title: game.title,
          status: "skipped",
          skipReason: "ambiguous",
          message: `${matches.length} resultados ambíguos`,
          matches,
          searchQuery,
        };
      }

      await enrichGameWithIgdb(game.id, match.igdbId);

      return {
        gameId: game.id,
        title: game.title,
        status: "success",
        message: match.name,
        searchQuery,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      return {
        gameId: game.id,
        title: game.title,
        status: "error",
        skipReason: "error",
        message:
          error instanceof Error ? error.message : "Erro desconhecido",
        searchQuery: suggestIgdbSearchQuery(game.title),
      };
    }
  };

  const waitBetweenGames = async (signal: AbortSignal) => {
    for (let seconds = IGDB_BULK_DELAY_MS / 1000; seconds > 0; seconds--) {
      setWaitingSeconds(seconds);
      await sleep(1000, signal);
    }
    setWaitingSeconds(0);
  };

  const runBulkEnrich = async () => {
    if (eligibleGames.length === 0) {
      toast.info("Não há jogos pendentes de enriquecimento");
      return;
    }

    const gamesToProcess = [...eligibleGames];
    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    resetRunState();
    setBatchTotal(gamesToProcess.length);
    setDialogOpen(true);

    const collected: BulkResult[] = [];

    try {
      for (let index = 0; index < gamesToProcess.length; index++) {
        const game = gamesToProcess[index];
        setCurrentIndex(index + 1);
        setCurrentTitle(game.title);

        const result = await processGame(game, controller.signal);
        collected.push(result);
        setResults([...collected]);

        const isLast = index === gamesToProcess.length - 1;
        if (!isLast) {
          await waitBetweenGames(controller.signal);
        }
      }

      const skipped = collected.filter((r) => r.status === "skipped").length;
      toast.success(
        `Concluído: ${collected.filter((r) => r.status === "success").length} enriquecidos`,
      );

      if (skipped > 0) {
        setActiveTab("review");
      }

      router.refresh();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.message("Enriquecimento em lote cancelado");
        if (collected.some((r) => r.status === "skipped")) {
          setActiveTab("review");
        }
      } else {
        toast.error("Erro inesperado no enriquecimento em lote");
      }
    } finally {
      setIsRunning(false);
      setWaitingSeconds(0);
      abortRef.current = null;
    }
  };

  const openReviewDialog = () => {
    if (reviewItems.length === 0 && eligibleGames.length === 0) {
      toast.info("Não há jogos pendentes de revisão");
      return;
    }
    setActiveTab("review");
    setDialogOpen(true);
  };

  const handleResolved = (gameId: string, igdbName: string) => {
    setResolvedIds((prev) => new Set(prev).add(gameId));
    setResults((prev) =>
      prev.map((result) =>
        result.gameId === gameId
          ? { ...result, status: "success", message: igdbName }
          : result,
      ),
    );
    router.refresh();
  };

  const handleOpenChange = (open: boolean) => {
    if (isRunning && !open) return;
    setDialogOpen(open);
  };

  const showReviewTab =
    reviewItems.length > 0 || (!isRunning && (skippedCount > 0 || errorCount > 0));

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={runBulkEnrich}
          disabled={isRunning || eligibleGames.length === 0}
          className="active:scale-[0.98]"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Enriquecer todos
        </Button>

        {(eligibleGames.length > 0 || reviewItems.length > 0) && (
          <Button variant="ghost" size="sm" onClick={openReviewDialog}>
            Revisar pendentes
            {reviewItems.length > 0 && ` (${reviewItems.length})`}
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>Enriquecimento IGDB</DialogTitle>
            <DialogDescription>
              Lote automático com intervalo de {IGDB_BULK_DELAY_MS / 1000}s.
              Pulados podem ser resolvidos na aba Revisar.
            </DialogDescription>
          </DialogHeader>

          {showReviewTab && (
            <div className="flex w-fit shrink-0 gap-1 rounded-lg bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("progress")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "progress"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Progresso
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "review"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Revisar ({reviewItems.length})
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            {activeTab === "progress" ? (
              <>
                {batchTotal > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium tabular-nums">
                        {processedCount}/{batchTotal}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {isRunning && currentTitle && (
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm">
                    <p className="font-medium truncate">
                      {currentIndex}. {currentTitle}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {waitingSeconds > 0
                        ? `Aguardando ${waitingSeconds}s para o próximo...`
                        : "Buscando e salvando no IGDB..."}
                    </p>
                  </div>
                )}

                {!isRunning && processedCount > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-md bg-green-500/10 px-2 py-2 text-green-500">
                      {successCount} ok
                    </div>
                    <div className="rounded-md bg-yellow-500/10 px-2 py-2 text-yellow-600">
                      {skippedCount} pulados
                    </div>
                    <div className="rounded-md bg-red-500/10 px-2 py-2 text-red-500">
                      {errorCount} erros
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="max-h-52 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/60">
                    {results.map((result) => (
                      <div
                        key={result.gameId}
                        className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <span className="truncate font-medium">
                          {result.title}
                        </span>
                        <span
                          className={
                            result.status === "success"
                              ? "shrink-0 text-green-500"
                              : result.status === "skipped"
                                ? "shrink-0 text-yellow-600"
                                : "shrink-0 text-red-500"
                          }
                        >
                          {result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <IgdbBulkReviewPanel items={reviewItems} onResolved={handleResolved} />
            )}
          </div>

          <DialogFooter className="shrink-0 border-t border-border/60 pt-4">
            {isRunning ? (
              <Button variant="destructive" onClick={handleCancel}>
                <Square className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            ) : (
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
