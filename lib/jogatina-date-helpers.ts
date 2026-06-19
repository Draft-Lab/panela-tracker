export interface JogatinaActivityTimestamps {
  date: string;
  first_event_at?: string | null;
  last_event_at?: string | null;
}

function toLocalDateKey(date: Date): string {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeToLocalDay(value: Date | string): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getJogatinaLastActivityAt(
  jogatina: JogatinaActivityTimestamps,
): string {
  return jogatina.last_event_at ?? jogatina.first_event_at ?? jogatina.date;
}

export interface PlayerSessionActivitySource {
  created_at?: string;
  jogatina: JogatinaActivityTimestamps & {
    session_type?: "solo" | "group";
  };
}

export function getPlayerSessionActivityTimestamps(
  entry: PlayerSessionActivitySource,
): JogatinaActivityTimestamps {
  const { jogatina } = entry;

  if (jogatina.session_type === "solo") {
    return {
      date: jogatina.date,
      first_event_at: jogatina.first_event_at ?? jogatina.date,
      last_event_at:
        jogatina.last_event_at ?? jogatina.first_event_at ?? jogatina.date,
    };
  }

  const joinAt =
    entry.created_at ??
    jogatina.first_event_at ??
    jogatina.date;

  const endAt =
    jogatina.last_event_at ??
    jogatina.first_event_at ??
    jogatina.date;

  return {
    date: joinAt,
    first_event_at: joinAt,
    last_event_at: endAt,
  };
}

export function getPlayerSessionLastActivityAt(
  entry: PlayerSessionActivitySource & {
    is_active?: boolean;
    jogatina: JogatinaActivityTimestamps & {
      session_type?: "solo" | "group";
      is_current?: boolean;
    };
  },
): string {
  return getJogatinaLastActivityAt(getPlayerSessionActivityTimestamps(entry));
}

export function comparePlayerSessionRecency(
  a: PlayerSessionActivitySource & {
    is_active?: boolean;
    jogatina: JogatinaActivityTimestamps & {
      session_type?: "solo" | "group";
      is_current?: boolean;
    };
  },
  b: PlayerSessionActivitySource & {
    is_active?: boolean;
    jogatina: JogatinaActivityTimestamps & {
      session_type?: "solo" | "group";
      is_current?: boolean;
    };
  },
): number {
  const aLive = a.jogatina.is_current && a.is_active ? 1 : 0;
  const bLive = b.jogatina.is_current && b.is_active ? 1 : 0;

  if (aLive !== bLive) {
    return bLive - aLive;
  }

  return (
    new Date(getPlayerSessionLastActivityAt(b)).getTime() -
    new Date(getPlayerSessionLastActivityAt(a)).getTime()
  );
}

export function getJogatinaActivityBounds(
  jogatina: JogatinaActivityTimestamps,
): { start: Date; end: Date } {
  const start = normalizeToLocalDay(
    jogatina.first_event_at ?? jogatina.date,
  );
  const end = normalizeToLocalDay(getJogatinaLastActivityAt(jogatina));

  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }

  return { start, end };
}

export function getJogatinaActivityDays(
  jogatina: JogatinaActivityTimestamps,
): Date[] {
  const { start, end } = getJogatinaActivityBounds(jogatina);
  const days: Date[] = [];
  const current = new Date(start);

  while (current.getTime() <= end.getTime()) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getJogatinaActivityDayKeys(
  jogatina: JogatinaActivityTimestamps,
): string[] {
  return getJogatinaActivityDays(jogatina).map((day) => toLocalDateKey(day));
}

export function splitMinutesAcrossActivityDays(
  jogatina: JogatinaActivityTimestamps,
  totalMinutes: number,
): Map<string, number> {
  const dayKeys = getJogatinaActivityDayKeys(jogatina);
  const distribution = new Map<string, number>();

  if (dayKeys.length === 0) {
    return distribution;
  }

  if (totalMinutes <= 0) {
    dayKeys.forEach((key) => distribution.set(key, 0));
    return distribution;
  }

  const baseMinutes = Math.floor(totalMinutes / dayKeys.length);
  let remainder = totalMinutes - baseMinutes * dayKeys.length;

  dayKeys.forEach((key) => {
    const minutes = baseMinutes + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    distribution.set(key, minutes);
  });

  return distribution;
}
