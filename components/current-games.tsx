"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Users, Clock, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CurrentJogatina {
  id: string;
  game_id: string;
  game: {
    title: string;
    cover_url: string | null;
  };
  jogatina_players: Array<{
    id: string;
    is_active: boolean;
    player: {
      name: string;
      avatar_url: string | null;
    };
  }>;
  session_type: string;
  source: string;
  notes: string | null;
  first_event_at: string | null;
}

function formatDuration(startedAt: string | null) {
  if (!startedAt) return null;

  const now = new Date();
  const start = new Date(startedAt);
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} min`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}min`;
}

export function CurrentGames() {
  const [currentJogatinas, setCurrentJogatinas] = useState<CurrentJogatina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentGames = async () => {
      const supabase = createClient();

      // Buscar todas as jogatinas ativas
      const { data } = await supabase
        .from("jogatinas")
        .select(
          `
          *,
          game:games(*),
          jogatina_players(
            *,
            player:players(*)
          )
        `,
        )
        .eq("is_current", true)
        .order("first_event_at", { ascending: false });

      setCurrentJogatinas(data || []);
      setLoading(false);
    };

    loadCurrentGames();
  }, []);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">
            Carregando...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentJogatinas || currentJogatinas.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Nenhum jogo sendo jogado no momento
          </p>
          <p className="text-sm text-muted-foreground">
            Quando alguém iniciar uma jogatina, ela aparecerá aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentJogatinas.map((jogatina) => {
        const duration = formatDuration(jogatina.first_event_at);

        // Filtrar apenas jogadores ativos
        const activePlayers = jogatina.jogatina_players.filter(
          (jp) => jp.is_active === true,
        );

        // Todos os jogadores que já participaram
        const allPlayers = jogatina.jogatina_players;
        const inactivePlayers = allPlayers.filter((jp) => !jp.is_active);

        return (
          <Card
            key={jogatina.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {jogatina.game?.cover_url ? (
                <img
                  src={jogatina.game.cover_url || "/placeholder.svg"}
                  alt={jogatina.game?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Gamepad2 className="h-16 w-16 text-primary/40" />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge className="animate-pulse bg-green-500 hover:bg-green-600">
                  {jogatina.session_type === "group" ? "Grupo" : "Solo"}
                </Badge>
                {jogatina.source === "discord_bot" && (
                  <Badge variant="outline" className="bg-background/90">
                    <Activity className="h-3 w-3 mr-1" />
                    Auto
                  </Badge>
                )}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">
                {jogatina.game?.title || "Sem título"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {activePlayers.length}{" "}
                  {activePlayers.length === 1
                    ? "jogador ativo"
                    : "jogadores ativos"}
                </span>
              </div>

              {duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Jogando há {duration}</span>
                </div>
              )}

              {/* Jogadores Ativos */}
              {activePlayers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    🎮 Jogando Agora
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activePlayers.map((jp) => (
                      <div
                        key={jp.id}
                        className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-md px-2.5 py-1.5 transition-colors hover:bg-green-500/20"
                      >
                        <Avatar className="h-6 w-6 border-2 border-green-500/50">
                          <AvatarImage
                            src={jp.player?.avatar_url || undefined}
                          />
                          <AvatarFallback className="text-xs bg-green-500/20">
                            {jp.player?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {jp.player?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jogadores Inativos */}
              {inactivePlayers.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">
                    Jogaram antes ({inactivePlayers.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {inactivePlayers.map((jp) => (
                      <div
                        key={jp.id}
                        className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1 opacity-60"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={jp.player?.avatar_url || undefined}
                          />
                          <AvatarFallback className="text-xs">
                            {jp.player?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {jp.player?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jogatina.notes && (
                <p className="text-sm text-muted-foreground italic pt-2 border-t">
                  {jogatina.notes}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}