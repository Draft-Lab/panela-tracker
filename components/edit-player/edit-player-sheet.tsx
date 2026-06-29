"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditPlayerBasicFields } from "@/components/edit-player/edit-player-basic-fields";
import { EditPlayerPlatinandoSection } from "@/components/edit-player/edit-player-platinando-section";
import { EditPlayerPlatinadosSection } from "@/components/edit-player/edit-player-platinados-section";
import {
  fetchGamesCatalog,
  fetchPlayerPlatinumGames,
} from "@/lib/player-platinum-mutations";
import { splitPlatinumGames } from "@/lib/player-platinum-helpers";
import { createClient } from "@/lib/supabase/client";
import type { Game, Player, PlayerPlatinumGame } from "@/lib/types";

interface EditPlayerSheetProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlayerSheet({
  player,
  open,
  onOpenChange,
}: EditPlayerSheetProps) {
  const [name, setName] = useState(player.name);
  const [discordId, setDiscordId] = useState(player.discord_id || "");
  const [avatarUrl, setAvatarUrl] = useState(player.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [platinumGames, setPlatinumGames] = useState<PlayerPlatinumGame[]>([]);
  const router = useRouter();

  const loadPlatinumData = useCallback(async () => {
    try {
      const [gamesData, platinumData] = await Promise.all([
        fetchGamesCatalog(),
        fetchPlayerPlatinumGames(player.id),
      ]);
      setGames(gamesData);
      setPlatinumGames(platinumData);
    } catch (error) {
      console.error("[EditPlayerSheet] Error loading data:", error);
      toast.error("Erro ao carregar dados de platinagem");
    }
  }, [player.id]);

  useEffect(() => {
    if (open) {
      setName(player.name);
      setDiscordId(player.discord_id || "");
      setAvatarUrl(player.avatar_url || "");
      loadPlatinumData();
    }
  }, [open, player, loadPlatinumData]);

  const handlePlatinumUpdated = () => {
    loadPlatinumData();
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!discordId.trim()) {
      toast.error("Discord ID é obrigatório");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    if (discordId.trim() !== player.discord_id) {
      const { data: existing } = await supabase
        .from("players")
        .select("id")
        .eq("discord_id", discordId.trim())
        .neq("id", player.id)
        .single();

      if (existing) {
        toast.error("Este Discord ID já está cadastrado em outro jogador");
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from("players")
      .update({
        name: name.trim(),
        discord_id: discordId.trim(),
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", player.id);

    if (error) {
      console.error("[EditPlayerSheet] Error updating player:", error);
      toast.error("Erro ao atualizar jogador: " + error.message);
    } else {
      toast.success("Perfil atualizado");
      onOpenChange(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  const { platinando, platinados } = splitPlatinumGames(platinumGames);
  const excludeGameIds = platinumGames.map((entry) => entry.game_id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden border-white/10 p-0 sm:max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b border-white/[0.06] px-6 py-5">
            <SheetTitle>Editar jogador</SheetTitle>
            <SheetDescription>
              Atualize os dados e a platinagem de {player.name}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <EditPlayerBasicFields
              name={name}
              discordId={discordId}
              avatarUrl={avatarUrl}
              onNameChange={setName}
              onDiscordIdChange={setDiscordId}
              onAvatarUrlChange={setAvatarUrl}
            />

            <EditPlayerPlatinandoSection
              playerId={player.id}
              platinando={platinando}
              games={games}
              excludeGameIds={excludeGameIds}
              onUpdated={handlePlatinumUpdated}
            />

            <EditPlayerPlatinadosSection
              playerId={player.id}
              platinados={platinados}
              platinando={platinando}
              games={games}
              onUpdated={handlePlatinumUpdated}
            />
          </div>

          <SheetFooter className="shrink-0 border-t border-white/[0.06] px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Salvando..." : "Salvar perfil"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/** @deprecated Use EditPlayerSheet */
export const EditPlayerDialog = EditPlayerSheet;
