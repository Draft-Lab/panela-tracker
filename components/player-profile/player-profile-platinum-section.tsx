"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Gamepad2, Star } from "lucide-react";
import { PlayerProfilePanel } from "@/components/player-profile/player-profile-panel";
import { PlatinumIndicator } from "@/components/player-profile/player-profile-platinando-now";
import { getGameCover, getGameTitle } from "@/lib/player-platinum-helpers";
import type { PlayerPlatinumGame } from "@/lib/types";
import { cn } from "@/lib/utils";

const CARD_WIDTH = "w-[6.25rem]";
const COVER_HEIGHT = "h-[8.25rem]";
const FOOTER_HEIGHT = "h-[3.25rem]";

interface PlayerProfilePlatinumSectionProps {
  platinando: PlayerPlatinumGame | null;
  platinados: PlayerPlatinumGame[];
}

function formatCompletedDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PlatinumCardShell({
  cover,
  footer,
  className,
}: {
  cover: ReactNode;
  footer: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn(CARD_WIDTH, "shrink-0")}>
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border bg-card/35",
          "transition-[border-color,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          className,
        )}
      >
        <div className={cn("relative w-full shrink-0 overflow-hidden bg-muted", COVER_HEIGHT)}>
          {cover}
        </div>
        <div className={cn("flex shrink-0 flex-col justify-center p-2", FOOTER_HEIGHT)}>
          {footer}
        </div>
      </div>
    </article>
  );
}

function CoverImage({ cover, title }: { cover: string | null; title: string }) {
  if (cover) {
    return (
      <Image
        src={cover}
        alt={title}
        fill
        sizes="100px"
        className="object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Gamepad2 className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}

function PlatinandoCard({ entry }: { entry: PlayerPlatinumGame }) {
  const cover = getGameCover(entry);
  const title = getGameTitle(entry);

  return (
    <PlatinumCardShell
      className="border-amber-400/25 hover:border-amber-400/35 hover:bg-amber-400/[0.03]"
      cover={
        <>
          <CoverImage cover={cover} title={title} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute left-1.5 top-1.5 flex h-5 items-center gap-1 rounded-full border border-amber-400/30 bg-black/55 px-1.5">
            <PlatinumIndicator className="h-1.5 w-1.5" />
            <span className="text-[9px] font-medium leading-none text-amber-400">
              Em progresso
            </span>
          </div>
        </>
      }
      footer={
        <>
          <p className="line-clamp-2 text-[11px] font-medium leading-snug">
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-400">
            <PlatinumIndicator className="h-1.5 w-1.5" />
            Platinando
          </p>
        </>
      }
    />
  );
}

function PlatinadoCard({ entry }: { entry: PlayerPlatinumGame }) {
  const cover = getGameCover(entry);
  const title = getGameTitle(entry);
  const completedLabel = formatCompletedDate(entry.completed_at);

  return (
    <PlatinumCardShell
      className="border-white/[0.08] hover:border-amber-400/20 hover:bg-card/45"
      cover={
        <>
          <CoverImage cover={cover} title={title} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute left-1.5 top-1.5 flex h-5 items-center gap-0.5 rounded-full border border-amber-400/30 bg-black/55 px-1.5">
            <Star
              className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
              strokeWidth={1.75}
            />
            <span className="text-[9px] font-medium leading-none text-amber-400">
              Platinado
            </span>
          </div>
        </>
      }
      footer={
        <>
          <p className="line-clamp-2 text-[11px] font-medium leading-snug">
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star
              className="h-2.5 w-2.5 shrink-0 fill-amber-400/80 text-amber-400/80"
              strokeWidth={1.75}
            />
            <span className="truncate">{completedLabel || "Concluído"}</span>
          </p>
        </>
      }
    />
  );
}

export function PlayerProfilePlatinumSection({
  platinando,
  platinados,
}: PlayerProfilePlatinumSectionProps) {
  if (!platinando && platinados.length === 0) {
    return null;
  }

  const countLabel =
    platinados.length === 1
      ? "1 platinado"
      : `${platinados.length} platinados`;

  return (
    <PlayerProfilePanel padding="compact" className="h-auto">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Platinagem
        </h2>
        {platinados.length > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {countLabel}
          </span>
        )}
      </div>

      <div className="relative -mx-1 min-w-0 w-full">
        <div
          className={cn(
            "overflow-x-auto overscroll-x-contain px-1 pb-1.5",
            "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]",
          )}
          role="list"
          aria-label="Jogos em platinagem"
        >
          <div className="flex w-max items-start gap-2.5 snap-x snap-mandatory">
            {platinando && (
              <div className="snap-start" role="listitem">
                <PlatinandoCard entry={platinando} />
              </div>
            )}
            {platinados.map((entry) => (
              <div key={entry.id} className="snap-start" role="listitem">
                <PlatinadoCard entry={entry} />
              </div>
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card/80 to-transparent"
          aria-hidden
        />
      </div>
    </PlayerProfilePanel>
  );
}
