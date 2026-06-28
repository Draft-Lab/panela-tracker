const PIXELS = [
  { top: "14%", left: "7%", opacity: 0.35 },
  { top: "22%", left: "18%", opacity: 0.2 },
  { top: "11%", left: "82%", opacity: 0.25 },
  { top: "28%", left: "91%", opacity: 0.15 },
  { top: "68%", left: "6%", opacity: 0.2 },
  { top: "78%", left: "14%", opacity: 0.12 },
  { top: "72%", left: "88%", opacity: 0.18 },
  { top: "84%", left: "76%", opacity: 0.1 },
  { top: "38%", left: "4%", opacity: 0.12 },
  { top: "52%", left: "95%", opacity: 0.22 },
] as const

const MARKS = [
  { top: "18%", left: "72%", char: "+" },
  { top: "62%", left: "22%", char: "+" },
  { top: "44%", left: "88%", char: "+" },
] as const

export function NotFoundDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {PIXELS.map((pixel, index) => (
        <span
          key={`pixel-${index}`}
          className="absolute size-1 rounded-full bg-primary"
          style={{
            top: pixel.top,
            left: pixel.left,
            opacity: pixel.opacity,
          }}
        />
      ))}

      {MARKS.map((mark, index) => (
        <span
          key={`mark-${index}`}
          className="absolute font-mono text-[10px] text-primary/25"
          style={{ top: mark.top, left: mark.left }}
        >
          {mark.char}
        </span>
      ))}

      <div
        className="absolute left-1/2 top-[46%] size-2 -translate-x-1/2 rounded-sm bg-primary/20"
        style={{ boxShadow: "6px 0 0 oklch(0.546 0.245 262.881 / 0.12)" }}
      />
    </div>
  )
}
