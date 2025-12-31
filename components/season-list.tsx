"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Edit,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { EditSeasonDialog } from "@/components/edit-season-dialog";
import { FinishSeasonDialog } from "@/components/finish-season-dialog";
import type { Player, SeasonWithDetails } from "@/lib/types";

interface SeasonListProps {
  seasons: SeasonWithDetails[];
  players: Player[];
}

export function SeasonList({ seasons, players }: SeasonListProps) {
  const [editingSeason, setEditingSeason] = useState<SeasonWithDetails | null>(null);
  const [finishingSeason, setFinishingSeason] = useState<SeasonWithDetails | null>(null);

  if (seasons.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {seasons.map((season) => {
          const duration = season.ended_at
            ? Math.floor(
                (new Date(season.ended_at).getTime() -
                  new Date(season.started_at).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : Math.floor(
                (Date.now() - new Date(season.started_at).getTime()) /
                  (1000 * 60 * 60 * 24),
              );

          const totalDuration =
            season.season_participants?.reduce(
              (sum: number, p) => sum + (p.total_duration_minutes || 0),
              0,
            ) || 0;

          return (
            <Card key={season.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-xl">{season.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {season.game?.title}
                    </p>
                    {season.description && (
                      <p className="text-sm text-muted-foreground italic">
                        {season.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {season.is_active ? (
                      <Badge className="bg-green-500">Ativa</Badge>
                    ) : (
                      <Badge variant="outline">Finalizada</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-2xl font-bold">{duration}</div>
                    <p className="text-xs text-muted-foreground">
                      {duration === 1 ? "dia" : "dias"}
                    </p>
                  </div>
                  <div>
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-2xl font-bold">
                      {season.season_participants?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">jogadores</p>
                  </div>
                  <div>
                    <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-2xl font-bold">
                      {Math.floor(totalDuration / 60)}h
                    </div>
                    <p className="text-xs text-muted-foreground">jogadas</p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <p className="text-sm font-medium mb-2">Participantes:</p>
                  <div className="flex flex-wrap gap-2">
                    {season.season_participants?.map((sp) => (
                      <div
                        key={sp.id}
                        className="flex items-center gap-1.5 bg-muted rounded-md px-2 py-1"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={sp.player?.avatar_url || undefined}
                          />
                          <AvatarFallback className="text-xs">
                            {sp.player?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{sp.player?.name}</span>
                        {sp.status && sp.status !== "Em andamento" && (
                          <Badge
                            variant="outline"
                            className={
                              sp.status === "Zero"
                                ? "text-green-500 border-green-500"
                                : sp.status === "Dropo"
                                  ? "text-red-500 border-red-500"
                                  : "text-yellow-500 border-yellow-500"
                            }
                          >
                            {sp.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/temporadas/${season.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  {season.is_active && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSeason(season)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFinishingSeason(season)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
