"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const SECTION_LINKS = [
  { href: "/#agora", label: "Agora" },
  { href: "/#jogos", label: "Jogos" },
  { href: "/#atividade", label: "Atividade" },
  { href: "/#vergonha", label: "Vergonha" },
  { href: "/#timeline", label: "Timeline" },
  { href: "/#metricas", label: "Métricas" },
  { href: "/#perfis", label: "Perfis" },
  { href: "/#destaques", label: "Destaques" },
] as const

export function LandingMobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="landing-mobile-menu"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted xl:hidden"
      >
        <Menu
          className={cn(
            "absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "rotate-45 opacity-0" : "rotate-0 opacity-100",
          )}
          strokeWidth={1.75}
        />
        <X
          className={cn(
            "absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "rotate-0 opacity-100" : "-rotate-45 opacity-0",
          )}
          strokeWidth={1.75}
        />
      </button>

      <div
        id="landing-mobile-menu"
        className={cn(
          "fixed inset-0 z-20 bg-background/90 backdrop-blur-xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] xl:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav
          aria-label="Seções da página"
          className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 px-6"
        >
          {SECTION_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "translate-y-4 text-2xl font-medium tracking-tight text-foreground opacity-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-muted-foreground",
                open && "translate-y-0 opacity-100",
              )}
              style={{ transitionDelay: open ? `${100 + index * 50}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
