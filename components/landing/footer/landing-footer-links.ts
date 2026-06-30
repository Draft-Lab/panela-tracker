export const FOOTER_NAV_COLUMNS = [
  {
    title: "Ao vivo",
    links: [
      { href: "/#agora", label: "Sessões agora" },
      { href: "/#jogos", label: "Ranking de jogos" },
      { href: "/#atividade", label: "Atividade" },
    ],
  },
  {
    title: "Histórico",
    links: [
      { href: "/#timeline", label: "Timeline" },
      { href: "/#vergonha", label: "Hall da vergonha" },
      { href: "/memorial", label: "Memorial" },
    ],
  },
  {
    title: "Grupo",
    links: [
      { href: "/#metricas", label: "Métricas" },
      { href: "/#perfis", label: "Perfis" },
      { href: "/#destaques", label: "Destaques" },
    ],
  },
] as const
