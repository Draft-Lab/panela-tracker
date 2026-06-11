"use client";

import { useState } from "react";
import { EditJogatinaDialog } from "@/components/edit-jogatina-dialog";
import { JogatinaListCard } from "@/components/jogatina-list-card";
import { JogatinaListCompactItem } from "@/components/jogatina-list-compact-item";
import { groupByDateLabel } from "@/lib/local-date";
import { createClient } from "@/lib/supabase/client";
import type { JogatinaWithDetails, Player } from "@/lib/types";
import { useRouter } from "next/navigation";

interface JogatinaListProps {
  jogatinas: JogatinaWithDetails[];
  allPlayers?: Player[];
  variant?: "default" | "compact";
  hideGameTitle?: boolean;
}

export function JogatinaList({
  jogatinas,
  allPlayers = [],
  variant = "default",
  hideGameTitle = false,
}: JogatinaListProps) {
  const router = useRouter();
  const [editingJogatina, setEditingJogatina] =
    useState<JogatinaWithDetails | null>(null);
  const isCompact = variant === "compact";

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta jogatina?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("jogatinas").delete().eq("id", id);

    if (error) {
      console.error("[v0] Error deleting jogatina:", error);
      alert("Erro ao excluir jogatina");
    } else {
      router.refresh();
    }
  };

  if (jogatinas.length === 0) {
    return (
      <div
        className={
          isCompact
            ? "py-10 text-center"
            : "rounded-xl border border-dashed border-border/60 py-12 text-center"
        }
      >
        <p className="text-muted-foreground">
          {isCompact
            ? "Nenhuma jogatina registrada."
            : "Nenhuma jogatina registrada ainda."}
        </p>
        {!isCompact && (
          <p className="mt-2 text-sm text-muted-foreground">
            As sessões aparecerão aqui conforme forem registradas.
          </p>
        )}
      </div>
    );
  }

  const renderItem = (jogatina: JogatinaWithDetails) => {
    const canEdit = !jogatina.season_id;
    const props = {
      jogatina,
      hideGameTitle,
      canEdit,
      onEdit: () => setEditingJogatina(jogatina),
      onDelete: () => handleDelete(jogatina.id),
    };

    return isCompact ? (
      <JogatinaListCompactItem key={jogatina.id} {...props} />
    ) : (
      <JogatinaListCard key={jogatina.id} {...props} />
    );
  };

  return (
    <>
      {isCompact ? (
        <div className="space-y-3">{jogatinas.map(renderItem)}</div>
      ) : (
        <div className="space-y-8">
          {groupByDateLabel(jogatinas, (j) => j.date).map(([label, group]) => (
            <section key={label}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {label}
              </h2>
              <div className="space-y-3">{group.map(renderItem)}</div>
            </section>
          ))}
        </div>
      )}

      {editingJogatina && (
        <EditJogatinaDialog
          jogatina={editingJogatina}
          allPlayers={allPlayers}
          open={!!editingJogatina}
          onOpenChange={(open) => !open && setEditingJogatina(null)}
        />
      )}
    </>
  );
}
