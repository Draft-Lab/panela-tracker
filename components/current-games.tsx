import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Users, Clock } from "lucide-react";

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

export async function CurrentGames() {
  const supabase = await createClient();

  // Buscar todas as jogatinas ativas (is_current = true)
  const { data: currentJogatinas } = await supabase
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
    .order("started_at", { ascending: false });

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

  // Agrupar por jogo - priorizar sessões em grupo
  const gameMap = new Map();

  for (const jogatina of currentJogatinas as any[]) {
    const gameId = jogatina.game_id;

    if (!gameMap.has(gameId)) {
      gameMap.set(gameId, jogatina);
    } else {
      // Se já existe uma sessão deste jogo, preferir a sessão em grupo
      const existing = gameMap.get(gameId);
      if (
        jogatina.session_type === "group" &&
        existing.session_type === "solo"
      ) {
        gameMap.set(gameId, jogatina);
      }
    }
  }

  const displayJogatinas = Array.from(gameMap.values());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayJogatinas.map((jogatina: any) => {
        const duration = formatDuration(jogatina.started_at);

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
              <Badge className="absolute top-2 right-2 animate-pulse bg-green-500 hover:bg-green-600">
                {jogatina.session_type === "group" ? "Grupo" : "Solo"}
              </Badge>
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
                  {jogatina.jogatina_players?.length || 0}{" "}
                  {jogatina.jogatina_players?.length === 1
                    ? "jogador"
                    : "jogadores"}
                </span>
              </div>

              {duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Jogando há {duration}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {jogatina.jogatina_players?.map((jp: any) => (
                  <div key={jp.id} className="flex items-center gap-1.5">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={jp.player?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {jp.player?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{jp.player?.name}</span>
                  </div>
                ))}
              </div>

              {jogatina.notes && (
                <p className="text-sm text-muted-foreground italic">
                  {jogatina.notes}
                </p>
              )}

              {jogatina.source === "discord_bot" && (
                <Badge variant="outline" className="w-fit">
                  Discord Bot
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
