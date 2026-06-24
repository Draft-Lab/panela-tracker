"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { glassSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface GameIgdbDetailsProps {
  game: Game;
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(glassSubtle, "px-3 py-2")}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function TagGroup({
  label,
  items,
}: {
  label: string;
  items: string[] | null | undefined;
}) {
  if (!items?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="bg-background/40">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ExpandableText({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 240;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p
        className={`text-sm leading-relaxed text-muted-foreground ${
          !expanded && isLong ? "line-clamp-4" : ""
        }`}
      >
        {text}
      </p>
      {isLong && (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 text-primary"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </Button>
      )}
    </div>
  );
}

export function GameIgdbDetails({ game }: GameIgdbDetailsProps) {
  if (!game.igdb_id) return null;

  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date).toLocaleDateString("pt-BR")
    : null;

  return (
    <DashboardPanel innerClassName="p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Sobre o jogo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Metadados importados do IGDB
          </p>
        </div>
        {game.igdb_url && (
          <Button variant="outline" size="sm" asChild className="active:scale-[0.98]">
            <a href={game.igdb_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver no IGDB
            </a>
          </Button>
        )}
      </div>

      <div className="space-y-6 px-4 py-5 sm:px-5">
        {(releaseDate || game.rating != null) && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {releaseDate && <MetaChip label="Lançamento" value={releaseDate} />}
            {game.rating != null && (
              <MetaChip
                label="Nota"
                value={`${Math.round(game.rating)}/100`}
              />
            )}
          </div>
        )}

        {game.summary && <ExpandableText title="Resumo" text={game.summary} />}
        {game.storyline && (
          <ExpandableText title="Enredo" text={game.storyline} />
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <TagGroup label="Gêneros" items={game.genres} />
          <TagGroup label="Plataformas" items={game.platforms} />
          <TagGroup label="Temas" items={game.themes} />
          <TagGroup label="Modos" items={game.game_modes} />
          <TagGroup label="Desenvolvedores" items={game.developers} />
        </div>

        {game.screenshots && game.screenshots.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Screenshots</p>
            <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
              {game.screenshots.map((screenshot, index) => (
                <a
                  key={screenshot}
                  href={screenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="snap-start shrink-0 overflow-hidden rounded-lg border border-border/70 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1} de ${game.title}`}
                    className="h-32 w-auto object-cover sm:h-36"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
