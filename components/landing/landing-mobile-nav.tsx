"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
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

const NAV_EASE = "cubic-bezier(0.32,0.72,0,1)"
const BODY_LOCK_CLASS = "landing-mobile-nav-open"

type MobileNavContextValue = {
  open: boolean
  toggle: () => void
  close: () => void
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null)

function useMobileNav() {
  const context = useContext(MobileNavContext)

  if (!context) {
    throw new Error("useMobileNav must be used within LandingMobileNav")
  }

  return context
}

function lockBodyScroll() {
  document.body.classList.add(BODY_LOCK_CLASS)
}

function unlockBodyScroll() {
  document.body.classList.remove(BODY_LOCK_CLASS)
}

function MobileNavTrigger() {
  const { open, toggle } = useMobileNav()

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="landing-mobile-menu"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      onClick={toggle}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted xl:hidden"
    >
      <span
        className={cn(
          "absolute h-0.5 w-[18px] rounded-full bg-current transition-transform duration-300",
          open ? "translate-y-0 rotate-45" : "-translate-y-[5px] rotate-0",
        )}
        style={{ transitionTimingFunction: NAV_EASE }}
      />
      <span
        className={cn(
          "absolute h-0.5 w-[18px] rounded-full bg-current transition-transform duration-300",
          open ? "translate-y-0 -rotate-45" : "translate-y-[5px] rotate-0",
        )}
        style={{ transitionTimingFunction: NAV_EASE }}
      />
    </button>
  )
}

function MobileNavOverlay() {
  const { open, close } = useMobileNav()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    lockBodyScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      unlockBodyScroll()
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close])

  if (!visible || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div
      id="landing-mobile-menu"
      className={cn(
        "fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl xl:hidden",
        "transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
      onClick={close}
      onTransitionEnd={(event) => {
        if (event.propertyName !== "opacity" || open) {
          return
        }

        setVisible(false)
      }}
    >
      <nav
        aria-label="Seções da página"
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 px-6 pt-24 pb-16"
        onClick={(event) => event.stopPropagation()}
      >
        {SECTION_LINKS.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            className={cn(
              "text-2xl font-medium tracking-tight text-foreground hover:text-muted-foreground",
              open
                ? "translate-y-0 opacity-100 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                : "translate-y-3 opacity-0",
            )}
            style={
              open ? { transitionDelay: `${80 + index * 45}ms` } : undefined
            }
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/memorial"
          onClick={close}
          className={cn(
            "mt-4 text-lg font-medium tracking-tight text-muted-foreground hover:text-foreground",
            open
              ? "translate-y-0 opacity-100 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              : "translate-y-3 opacity-0",
          )}
          style={open ? { transitionDelay: "440ms" } : undefined}
        >
          Memorial
        </Link>
      </nav>
    </div>,
    document.body,
  )
}

export function LandingMobileNav() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((value) => !value), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <MobileNavContext.Provider value={{ open, toggle, close }}>
      <MobileNavTrigger />
      <MobileNavOverlay />
    </MobileNavContext.Provider>
  )
}
