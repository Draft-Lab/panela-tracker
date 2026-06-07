const HUNDRED_HOURS_MINUTES = 100 * 60;

export interface PlayerProfileSummary {
  totalMinutes: number;
  totalSessions: number;
  uniqueGames: number;
  drops: number;
  zeros: number;
  davaPraJogar: number;
  dropRate: number;
}
export interface PlayerAchievementDefinition {
  id: string;
  label: string;
  description: string;
  priority: number;
  style: string;
  check: (summary: PlayerProfileSummary) => boolean;
}

export interface PlayerAchievement {
  id: string;
  label: string;
  description: string;
  style: string;
}

export const ACHIEVEMENT_STYLES = {
  veterano: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  lenda: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400",
  maratonista: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  firme: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  experimentador: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  disponivel: "border-teal-500/30 bg-teal-500/10 text-teal-400",
  fantasma: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  explorador: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  catalogo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  fiel: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  novato: "border-border/60 bg-muted/40 text-muted-foreground",
} as const;

const PLAYER_ACHIEVEMENTS: PlayerAchievementDefinition[] = [
  {
    id: "lenda",
    label: "Lenda",
    description: "Mais de 50 sessões ou 100 horas jogadas no grupo.",
    priority: 100,
    style: ACHIEVEMENT_STYLES.lenda,
    check: (s) =>
      s.totalSessions > 50 || s.totalMinutes >= HUNDRED_HOURS_MINUTES,
  },
  {
    id: "catalogo",
    label: "Catálogo",
    description: "Jogou 15 ou mais títulos diferentes com o grupo.",
    priority: 90,
    style: ACHIEVEMENT_STYLES.catalogo,
    check: (s) => s.uniqueGames >= 15,
  },
  {
    id: "firme",
    label: "Firme",
    description: "Nunca dropou e tem mais de 5 sessões registradas.",
    priority: 85,
    style: ACHIEVEMENT_STYLES.firme,
    check: (s) => s.drops === 0 && s.totalSessions > 5,
  },
  {
    id: "veterano",
    label: "Veterano",
    description: "Mais de 20 sessões com o grupo.",
    priority: 80,
    style: ACHIEVEMENT_STYLES.veterano,
    check: (s) => s.totalSessions > 20,
  },
  {
    id: "explorador",
    label: "Explorador",
    description: "Jogou 8 ou mais títulos diferentes.",
    priority: 75,
    style: ACHIEVEMENT_STYLES.explorador,
    check: (s) => s.uniqueGames >= 8,
  },
  {
    id: "maratonista",
    label: "Maratonista",
    description: "Média acima de 1 hora por sessão.",
    priority: 70,
    style: ACHIEVEMENT_STYLES.maratonista,
    check: (s) =>
      s.totalSessions > 0 && s.totalMinutes > s.totalSessions * 60,
  },
  {
    id: "experimentador",
    label: "Experimentador",
    description: "Mais de 30% das sessões terminaram em drop.",
    priority: 65,
    style: ACHIEVEMENT_STYLES.experimentador,
    check: (s) => s.drops > s.totalSessions * 0.3,
  },
  {
    id: "disponivel",
    label: "Disponível",
    description: "Marcou Dava pra jogar em 10 ou mais sessões.",
    priority: 60,
    style: ACHIEVEMENT_STYLES.disponivel,
    check: (s) => s.davaPraJogar >= 10,
  },
  {
    id: "fiel",
    label: "Fiel",
    description: "Focou em até 3 jogos com 15 ou mais sessões.",
    priority: 55,
    style: ACHIEVEMENT_STYLES.fiel,
    check: (s) => s.uniqueGames <= 3 && s.uniqueGames > 0 && s.totalSessions >= 15,
  },
  {
    id: "fantasma",
    label: "Fantasma",
    description: "Marcou Zero em 5 ou mais sessões.",
    priority: 50,
    style: ACHIEVEMENT_STYLES.fantasma,
    check: (s) => s.zeros >= 5,
  },
];

const NOVATO_ACHIEVEMENT: PlayerAchievementDefinition = {
  id: "novato",
  label: "Novato",
  description: "Ainda começando a jornada no grupo.",
  priority: 10,
  style: ACHIEVEMENT_STYLES.novato,
  check: (s) => s.totalSessions < 5,
};

function toAchievement(def: PlayerAchievementDefinition): PlayerAchievement {
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    style: def.style,
  };
}

export function getPlayerAchievements(
  summary: PlayerProfileSummary,
  options?: { limit?: number },
): PlayerAchievement[] {
  const unlocked = PLAYER_ACHIEVEMENTS.filter((def) => def.check(summary))
    .sort((a, b) => b.priority - a.priority)
    .map(toAchievement);

  if (unlocked.length === 0 && NOVATO_ACHIEVEMENT.check(summary)) {
    return [toAchievement(NOVATO_ACHIEVEMENT)];
  }

  if (options?.limit !== undefined) {
    return unlocked.slice(0, options.limit);
  }

  return unlocked;
}

export function getAchievementStyle(label: string): string {
  const def =
    PLAYER_ACHIEVEMENTS.find((a) => a.label === label) ??
    (NOVATO_ACHIEVEMENT.label === label ? NOVATO_ACHIEVEMENT : null);
  return def?.style ?? ACHIEVEMENT_STYLES.novato;
}
