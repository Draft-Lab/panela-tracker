import type { IgdbSearchMatch } from "@/lib/igdb/types";

export type BulkResultStatus = "success" | "skipped" | "error";

export type BulkSkipReason = "not_found" | "ambiguous" | "error" | "pending";

export interface BulkResult {
  gameId: string;
  title: string;
  status: BulkResultStatus;
  message: string;
  skipReason?: BulkSkipReason;
  matches?: IgdbSearchMatch[];
  searchQuery?: string;
}

export interface IgdbReviewItem {
  gameId: string;
  title: string;
  reason: BulkSkipReason;
  message: string;
  matches?: IgdbSearchMatch[];
  searchQuery: string;
}

export function bulkResultToReviewItem(result: BulkResult): IgdbReviewItem {
  return {
    gameId: result.gameId,
    title: result.title,
    reason: result.skipReason ?? "pending",
    message: result.message,
    matches: result.matches,
    searchQuery: result.searchQuery ?? result.title,
  };
}
