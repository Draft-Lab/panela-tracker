import Image from "next/image"
import { cn } from "@/lib/utils"

interface PanelaLogoProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg"
}

const SIZE_CLASS = {
  xs: "h-3.5 w-auto",
  sm: "h-4 w-auto",
  md: "h-6 w-auto",
  lg: "h-7 w-auto",
} as const

export function PanelaLogo({ className, size = "sm" }: PanelaLogoProps) {
  return (
    <Image
      src="/pt.svg"
      alt=""
      width={537}
      height={410}
      className={cn(SIZE_CLASS[size], className)}
      aria-hidden
      priority
    />
  )
}
