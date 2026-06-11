"use client";

import { useState } from "react";
import { EditSeasonDialog } from "@/components/edit-season-dialog";
import { FinishSeasonDialog } from "@/components/finish-season-dialog";
import { SeasonListCard } from "@/components/season-list-card";
import type { Player, SeasonWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeasonListProps {
  seasons: SeasonWithDetails[];
  players: Player[];
  featuredSingle?: boolean;
}

export function SeasonList({
  seasons,
  players,
  featuredSingle = false,
}: SeasonListProps) {
  const [editingSeason, setEditingSeason] = useState<SeasonWithDetails | null>(
    null,
  );
  const [finishingSeason, setFinishingSeason] =
    useState<SeasonWithDetails | null>(null);

  if (seasons.length === 0) return null;

  const showFeatured = featuredSingle && seasons.length === 1;

  return (
    <>
      <div
        className={cn(
          "grid gap-4",
          showFeatured ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2",
        )}
      >
        {seasons.map((season) => (
          <SeasonListCard
            key={season.id}
            season={season}
            featured={showFeatured}
            onEdit={() => setEditingSeason(season)}
            onFinish={() => setFinishingSeason(season)}
          />
        ))}
      </div>

      {editingSeason && (
        <EditSeasonDialog
          season={editingSeason}
          players={players}
          open={!!editingSeason}
          onOpenChange={(open) => !open && setEditingSeason(null)}
        />
      )}

      {finishingSeason && (
        <FinishSeasonDialog
          season={finishingSeason}
          open={!!finishingSeason}
          onOpenChange={(open) => !open && setFinishingSeason(null)}
        />
      )}
    </>
  );
}
