import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ActiveSeasonsWidgetProps {
  seasons: any[];
}

export function ActiveSeasonsWidget({ seasons }: ActiveSeasonsWidgetProps) {
  if (seasons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Temporadas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma temporada ativa no momento
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/temporadas">Criar Temporada</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Temporadas Ativas
          </CardTitle>
          <Badge className="bg-green-500">{seasons.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {seasons.map((season) => {
          const daysActive = Math.floor(
            (Date.now() - new Date(season.started_at).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          return (
            <Link
              key={season.id}
              href={`/dashboard/temporadas/${season.id}`}
              className="block p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{season.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {season.game?.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {daysActive} {daysActive === 1 ? "dia" : "dias"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {season.season_participants?.length || 0}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}

        <Button variant="outline" className="w-full mt-2" asChild>
          <Link href="/dashboard/temporadas">Ver Todas as Temporadas</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
