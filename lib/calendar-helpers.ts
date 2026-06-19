import {
  getJogatinaActivityDays,
  splitMinutesAcrossActivityDays,
} from "@/lib/jogatina-date-helpers";
import type { Jogatina, Game } from "@/lib/types";

export type JogatinaWithGame = Jogatina & { game: Game };

export interface CalendarGameEntry {
  game: Game;
  jogatina: JogatinaWithGame;
  totalMinutes: number;
  sessionCount: number;
}

export interface CalendarDayData {
  date: Date;
  jogatinas: JogatinaWithGame[];
  primaryJogatina: JogatinaWithGame | null;
  uniqueGames: CalendarGameEntry[];
  gameCount: number;
  uniqueGameCount: number;
  totalMinutes: number;
}

export interface CalendarCell {
  date: Date;
  isPadding: boolean;
  weekNumber: number | null;
  isFirstDayOfWeek: boolean;
}

export function getDateKey(date: Date): string {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getISOWeekNumber(date: Date): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));

  const weekStart = new Date(target.getFullYear(), 0, 4);
  weekStart.setHours(0, 0, 0, 0);

  return (
    1 +
    Math.round(
      ((target.getTime() - weekStart.getTime()) / 86400000 -
        3 +
        ((weekStart.getDay() + 6) % 7)) /
        7,
    )
  );
}

export function pickPrimaryJogatina(
  jogatinas: JogatinaWithGame[],
): JogatinaWithGame | null {
  if (jogatinas.length === 0) return null;

  return [...jogatinas].sort((a, b) => {
    const durationDiff =
      (b.total_duration_minutes || 0) - (a.total_duration_minutes || 0);
    if (durationDiff !== 0) return durationDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  })[0];
}

export function getUniqueGamesForDay(
  jogatinas: JogatinaWithGame[],
): CalendarGameEntry[] {
  const byGame = new Map<string, CalendarGameEntry>();

  jogatinas.forEach((jogatina) => {
    const gameId = jogatina.game_id;

    if (!byGame.has(gameId)) {
      byGame.set(gameId, {
        game: jogatina.game,
        jogatina,
        totalMinutes: 0,
        sessionCount: 0,
      });
    }

    const entry = byGame.get(gameId)!;
    entry.sessionCount++;
    entry.totalMinutes += jogatina.total_duration_minutes || 0;

    if (
      (jogatina.total_duration_minutes || 0) >
      (entry.jogatina.total_duration_minutes || 0)
    ) {
      entry.jogatina = jogatina;
    }
  });

  return Array.from(byGame.values()).sort(
    (a, b) => b.totalMinutes - a.totalMinutes,
  );
}

export function groupJogatinasByDay(
  jogatinas: JogatinaWithGame[],
): Map<string, CalendarDayData> {
  const dayMap = new Map<string, CalendarDayData>();

  jogatinas.forEach((jogatina) => {
    const activityDays = getJogatinaActivityDays(jogatina);
    const minutesByDay = splitMinutesAcrossActivityDays(
      jogatina,
      jogatina.total_duration_minutes || 0,
    );

    activityDays.forEach((activityDay) => {
      const key = getDateKey(activityDay);

      if (!dayMap.has(key)) {
        dayMap.set(key, {
          date: new Date(activityDay),
          jogatinas: [],
          primaryJogatina: null,
          uniqueGames: [],
          gameCount: 0,
          uniqueGameCount: 0,
          totalMinutes: 0,
        });
      }

      const dayData = dayMap.get(key)!;
      dayData.jogatinas.push(jogatina);
      dayData.gameCount++;
      dayData.totalMinutes += minutesByDay.get(key) || 0;
    });
  });

  dayMap.forEach((dayData) => {
    dayData.uniqueGames = getUniqueGamesForDay(dayData.jogatinas);
    dayData.uniqueGameCount = dayData.uniqueGames.length;
    dayData.primaryJogatina = pickPrimaryJogatina(dayData.jogatinas);
  });

  return dayMap;
}

export function getSegmentFillCount(uniqueGameCount: number): number {
  return Math.min(uniqueGameCount, 4);
}

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(year, month + 1, 0);
  lastDay.setHours(0, 0, 0, 0);

  const leadingPadding = (firstDay.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let i = leadingPadding; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    date.setHours(0, 0, 0, 0);
    cells.push({
      date,
      isPadding: true,
      weekNumber: null,
      isFirstDayOfWeek: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const isFirstDayOfWeek = date.getDay() === 1;

    cells.push({
      date,
      isPadding: false,
      weekNumber: isFirstDayOfWeek ? getISOWeekNumber(date) : null,
      isFirstDayOfWeek,
    });
  }

  const trailingPadding = (7 - ((cells.length + 7) % 7)) % 7;
  for (let i = 1; i <= trailingPadding; i++) {
    const date = new Date(year, month + 1, i);
    date.setHours(0, 0, 0, 0);
    cells.push({
      date,
      isPadding: true,
      weekNumber: null,
      isFirstDayOfWeek: false,
    });
  }

  return cells;
}

export function formatMonthLabel(date: Date): string {
  const formatted = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDayLabel(date: Date): string {
  return date.getDate().toString();
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return getDateKey(a) === getDateKey(b);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
