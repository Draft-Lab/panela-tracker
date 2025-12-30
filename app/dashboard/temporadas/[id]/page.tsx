import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JogatinaList } from "@/components/jogatina-list";

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  // Buscar temporada com todos os detalhes
  const { data: season, error } = await supabase
    .from("seasons")
    .select(
      `
      *,
      game:games(*),
      season_participants(
        *,
        player:players(*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !season) {
    notFound();
  }

  // Buscar jogatinas desta temporada
  const { data: jogatinas } = await supabase
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
    .eq("season_id", id)
    .order("date", { ascending: false });

  // Calcular estatísticas
  const durationDays = season.ended_at
    ? Math.floor(
        (new Date(season.ended_at).getTime() -
          new Date(season.started_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : Math.floor(
        (Date.now() - new Date(season.started_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );

  const totalSessions = season.season_participants?.reduce(
    (sum: number, p: any) => sum + (p.total_sessions || 0),
    0,
  );

  const totalDuration = season.season_participants?.reduce(
    (sum: number, p: any) => sum + (p.total_duration_minutes || 0),
    0,
  );

  // Contar status
  const statusCounts = season.season_participants?.reduce(
    (acc: any, p: any) => {
      acc[p.status || "Em andamento"] =
        (acc[p.status || "Em andamento"] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/temporadas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Temporadas
          </Link>
        </Button>

        <div className="flex items-start gap-6">
          <div className="shrink-0">
            {season.game?.cover_url ? (
              <img
                src={season.game.cover_url || "/placeholder.svg"}
                alt={season.game?.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <Trophy className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{season.name}</h1>
              {season.is_active ? (
                <Badge className="bg-green-500">Ativa</Badge>
              ) : (
                <Badge variant="outline">Finalizada</Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              {season.game?.title}
            </p>
            {season.description && (
              <p className="text-muted-foreground italic">
                {season.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duração
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{durationDays}</div>
            <p className="text-xs text-muted-foreground">
              {durationDays === 1 ? "dia" : "dias"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {season.season_participants?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">jogadores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessões
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              jogatinas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Total
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor((totalDuration || 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">jogadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Participantes */}
      <Card>
        <CardHeader>
          <CardTitle>Participantes e Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {season.season_participants?.map((sp: any) => (
              <div
                key={sp.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sp.player?.avatar_url || undefined} />
                    <AvatarFallback>
                      {sp.player?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{sp.player?.name}</p>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{sp.total_sessions || 0} sessões</span>
                      <span>•</span>
                      <span>
                        {Math.floor((sp.total_duration_minutes || 0) / 60)}h
                        jogadas
                      </span>
                      {sp.solo_duration_minutes > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {Math.floor(sp.solo_duration_minutes / 60)}h solo
                          </span>
                        </>
                      )}
                      {sp.group_duration_minutes > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {Math.floor(sp.group_duration_minutes / 60)}h grupo
                          </span>
                        </>
                      )}
                    </div>
                    {sp.notes && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        {sp.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    sp.status === "Zero"
                      ? "text-green-500 border-green-500"
                      : sp.status === "Dropo"
                        ? "text-red-500 border-red-500"
                        : sp.status === "Dava pra jogar"
                          ? "text-yellow-500 border-yellow-500"
                          : ""
                  }
                >
                  {sp.status || "Em andamento"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jogatinas da Temporada */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Sessões desta Temporada ({jogatinas?.length || 0})
        </h2>
        {jogatinas && jogatinas.length > 0 ? (
          <JogatinaList jogatinas={jogatinas} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma sessão registrada ainda nesta temporada.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                As sessões serão associadas automaticamente quando jogadores
                iniciarem o jogo.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
