import { Crosshair, Radio } from "lucide-react"

/** Small WARDOGS-inspired marks, without adding another content block. */
export function HomepageTacticalMark({ variant = "tags" }: { variant?: "tags" | "radio" | "target" }) {
  return <span className={`homepage-tactical-mark homepage-tactical-mark-${variant}`} aria-hidden="true">
    {variant === "tags" ? <img src="/panela-wardogs-insignia.webp" alt="" width={180} height={180} loading="lazy" decoding="async" /> : variant === "radio" ? <Radio size={24} strokeWidth={1.5} /> : <Crosshair size={32} strokeWidth={1.25} />}
  </span>
}
