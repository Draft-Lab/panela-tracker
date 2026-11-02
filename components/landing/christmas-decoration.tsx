const decorations = {
  gifts: { src: "/panela-natal-presentes.webp", className: "christmas-decoration-gifts" },
  tree: { src: "/panela-natal-pinheiro.webp", className: "christmas-decoration-tree" },
} as const

export type ChristmasDecorationKind = keyof typeof decorations

/** Seasonal accents are decorative and never affect section layout or interaction. */
export function ChristmasDecoration({ kind }: { kind: ChristmasDecorationKind }) {
  const decoration = decorations[kind]
  return <img className={`christmas-decoration ${decoration.className}`} src={decoration.src} alt="" aria-hidden="true" width={320} height={320} loading="lazy" decoding="async" />
}
