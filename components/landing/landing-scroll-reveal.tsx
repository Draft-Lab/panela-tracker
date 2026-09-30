"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LandingScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  variant?: "default" | "hero"
}

export function LandingScrollReveal({
  children,
  className,
  delay = 0,
  variant = "default",
}: LandingScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // Server output stays readable without JavaScript; only offscreen content is staged.
    if (element.getBoundingClientRect().top > window.innerHeight) setVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[transform,opacity,filter]",
        "motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none",
        variant === "hero"
          ? "duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          : "duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : variant === "hero"
            ? "translate-y-16 opacity-0 blur-md"
            : "translate-y-3 opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  )
}
