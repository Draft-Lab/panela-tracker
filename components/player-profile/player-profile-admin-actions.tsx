"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditPlayerDialog } from "@/components/edit-player-dialog";
import type { Player } from "@/lib/types";

interface PlayerProfileAdminActionsProps {
  player: Player;
}

export function PlayerProfileAdminActions({ player }: PlayerProfileAdminActionsProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar perfil
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/jogadores/${player.id}`} target="_blank" rel="noopener noreferrer">
            Ver perfil público
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <EditPlayerDialog player={player} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
