export const PLAYER_CARD_ACCENTS = [
  {
    ring: "ring-sky-500/40",
    header: "from-sky-500/25 via-sky-500/5 to-transparent",
    surface: "from-sky-500/12 via-card/40 to-background",
    fallback: "bg-sky-500/20 text-sky-300",
    hoverBorder: "group-hover:border-sky-500/25",
  },
  {
    ring: "ring-violet-500/40",
    header: "from-violet-500/25 via-violet-500/5 to-transparent",
    surface: "from-violet-500/12 via-card/40 to-background",
    fallback: "bg-violet-500/20 text-violet-300",
    hoverBorder: "group-hover:border-violet-500/25",
  },
  {
    ring: "ring-emerald-500/40",
    header: "from-emerald-500/25 via-emerald-500/5 to-transparent",
    surface: "from-emerald-500/12 via-card/40 to-background",
    fallback: "bg-emerald-500/20 text-emerald-300",
    hoverBorder: "group-hover:border-emerald-500/25",
  },
  {
    ring: "ring-amber-500/40",
    header: "from-amber-500/25 via-amber-500/5 to-transparent",
    surface: "from-amber-500/12 via-card/40 to-background",
    fallback: "bg-amber-500/20 text-amber-300",
    hoverBorder: "group-hover:border-amber-500/25",
  },
  {
    ring: "ring-rose-500/40",
    header: "from-rose-500/25 via-rose-500/5 to-transparent",
    surface: "from-rose-500/12 via-card/40 to-background",
    fallback: "bg-rose-500/20 text-rose-300",
    hoverBorder: "group-hover:border-rose-500/25",
  },
  {
    ring: "ring-cyan-500/40",
    header: "from-cyan-500/25 via-cyan-500/5 to-transparent",
    surface: "from-cyan-500/12 via-card/40 to-background",
    fallback: "bg-cyan-500/20 text-cyan-300",
    hoverBorder: "group-hover:border-cyan-500/25",
  },
] as const;

export function getPlayerCardAccentIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % PLAYER_CARD_ACCENTS.length;
  }
  return hash;
}
