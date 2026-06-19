"use client";

import { Fragment, useMemo, useState, type MouseEvent } from "react";
import { formatDuration, getDateKey } from "@/lib/calendar-helpers";
import type { PlayerParticipationDay } from "@/lib/player-profile-helpers";

interface PlayerProfileHeatmapProps {
  participationDays: PlayerParticipationDay[];
}

interface DayData {
  date: Date;
  count: number;
  totalMinutes: number;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const INTENSITY_COLORS = [
  "bg-muted",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/80",
];

function getIntensityLevel(count: number, maxCount: number) {
  if (count === 0) return 0;
  const percentage = (count / maxCount) * 100;
  if (percentage <= 25) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 75) return 3;
  return 4;
}

export function PlayerProfileHeatmap({
  participationDays,
}: PlayerProfileHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { weeks, monthLabels, maxCount } = useMemo(() => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    startDate.setHours(0, 0, 0, 0);

    const dayDataMap = new Map<string, DayData>();

    participationDays.forEach((entry) => {
      const jogatinaDate = new Date(entry.date);
      jogatinaDate.setHours(0, 0, 0, 0);

      if (jogatinaDate >= startDate && jogatinaDate <= endDate) {
        const key = getDateKey(jogatinaDate);
        dayDataMap.set(key, {
          date: new Date(jogatinaDate),
          count: entry.count,
          totalMinutes: entry.totalMinutes,
        });
      }
    });

    const allDays: DayData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const key = getDateKey(currentDate);
      allDays.push(
        dayDataMap.get(key) || {
          date: new Date(currentDate),
          count: 0,
          totalMinutes: 0,
        },
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const counts = allDays.filter((d) => d.count > 0).map((d) => d.count);
    const computedMaxCount = Math.max(...counts, 1);

    const builtWeeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    const firstDayOfWeek = allDays[0].date.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), count: -1, totalMinutes: 0 });
    }

    allDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        builtWeeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), count: -1, totalMinutes: 0 });
      }
      builtWeeks.push(currentWeek);
    }

    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    builtWeeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d.count >= 0);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: firstValidDay.date.toLocaleDateString("pt-BR", {
              month: "short",
            }),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return {
      weeks: builtWeeks,
      monthLabels: labels,
      maxCount: computedMaxCount,
    };
  }, [participationDays]);

  const handleMouseEnter = (day: DayData, event: MouseEvent) => {
    if (day.count >= 0) {
      setHoveredDay(day);
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const gridColumns = `2.25rem repeat(${weeks.length}, minmax(0, 1fr))`;

  if (participationDays.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
        Nenhuma atividade nos ultimos 12 meses
      </p>
    );
  }

  return (
    <div className="min-w-0 w-full">
      <div
        className="mb-2 grid gap-[3px]"
        style={{ gridTemplateColumns: gridColumns }}
      >
        <div />
        {weeks.map((_, weekIndex) => {
          const label = monthLabels.find((m) => m.weekIndex === weekIndex);
          return (
            <div
              key={`month-${weekIndex}`}
              className="truncate text-[10px] leading-none text-muted-foreground"
            >
              {label
                ? label.month.charAt(0).toUpperCase() + label.month.slice(1)
                : ""}
            </div>
          );
        })}
      </div>

      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: gridColumns }}
      >
        {WEEKDAY_LABELS.map((weekdayLabel, rowIndex) => (
          <Fragment key={weekdayLabel}>
            <div className="flex items-center text-[10px] leading-none text-muted-foreground">
              {weekdayLabel}
            </div>
            {weeks.map((week, weekIndex) => {
              const day = week[rowIndex];
              const dayKey = getDateKey(day.date);
              const uniqueKey =
                day.count < 0 ? `empty-${weekIndex}-${rowIndex}` : dayKey;

              if (day.count < 0) {
                return (
                  <div
                    key={uniqueKey}
                    className="aspect-square w-full min-w-0 rounded-[2px]"
                  />
                );
              }

              const level = getIntensityLevel(day.count, maxCount);

              return (
                <div
                  key={uniqueKey}
                  className={`aspect-square w-full min-w-0 rounded-[2px] ${INTENSITY_COLORS[level]} transition-colors hover:ring-1 hover:ring-primary`}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-1">
          {INTENSITY_COLORS.map((color, index) => (
            <div key={index} className={`h-3 w-3 rounded-[2px] ${color}`} />
          ))}
        </div>
        <span>Mais</span>
      </div>

      {hoveredDay && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
          style={{
            left: Math.min(mousePosition.x + 10, window.innerWidth - 200),
            top: Math.min(mousePosition.y + 10, window.innerHeight - 120),
          }}
        >
          <div className="font-semibold">
            {hoveredDay.date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-muted-foreground">
            {hoveredDay.count}{" "}
            {hoveredDay.count === 1 ? "sessao" : "sessoes"}
          </div>
          {hoveredDay.totalMinutes > 0 && (
            <div className="text-xs text-muted-foreground">
              {formatDuration(hoveredDay.totalMinutes)} jogados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
