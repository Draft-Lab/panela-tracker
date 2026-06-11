"use client";

import type { Player } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditPlayerDialog } from "@/components/edit-player-dialog";
import { PlayerListCard } from "@/components/player-list-card";

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  const router = useRouter();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) {
      console.error("[v0] Error deleting player:", error);
      alert("Erro ao excluir jogador");
    } else {
      router.refresh();
    }
  };

  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
        <p className="text-muted-foreground">Nenhum jogador cadastrado ainda.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Clique em &quot;Adicionar Jogador&quot; para começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <PlayerListCard
            key={player.id}
            player={player}
            onEdit={() => setEditingPlayer(player)}
            onDelete={() => handleDelete(player.id)}
          />
        ))}
      </div>

      {editingPlayer && (
        <EditPlayerDialog
          player={editingPlayer}
          open={!!editingPlayer}
          onOpenChange={(open) => !open && setEditingPlayer(null)}
        />
      )}
    </>
  );
}
