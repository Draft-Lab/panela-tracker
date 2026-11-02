import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Scalable wooden frame; the image stays outside the content and never captures input. */
export function ChristmasFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("christmas-frame", className)}>
    <div className="christmas-frame-content">{children}</div>
  </div>
}
