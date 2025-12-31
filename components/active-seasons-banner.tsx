import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame } from "lucide-react";
import type { SeasonWithDetails } from "@/lib/types";

interface ActiveSeasonsBannerProps {
  seasons: SeasonWithDetails[];
}

export function ActiveSeasonsBanner({ seasons }: ActiveSeasonsBannerProps) {
  if (seasons.length === 0) return null;

  return (
    <Card className="bg-linear-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="py-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-6 w-6 text-primary animate-pulse" />
          <h3 className="text-xl font-bold">
            {seasons.length === 1 ? "Temporada Ativa" : "Temporadas Ativas"}
          </h3>
          <Badge className="bg-primary">{seasons.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => {
            const daysActive = Math.floor(
              (Date.now() - new Date(season.started_at).getTime()) /
                (1000 * 60 * 60 * 24),
            );

            return (
              <div
                key={season.id}
                className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{season.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {season.game?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>
                    {daysActive}{" "}
                    {daysActive === 1 ? "dia ativo" : "dias ativos"}
                  </span>
                  <span>
                    {season.season_participants?.length || 0} participantes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
