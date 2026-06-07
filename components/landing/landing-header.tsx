import Link from "next/link"
import { Gamepad2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
            <Gamepad2 className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-none">Panela Tracker</p>
            <p className="truncate text-xs text-muted-foreground">
              Dashboard do grupo
            </p>
          </div>
        </Link>

        <nav
          aria-label="Seções da página"
          className="hidden items-center gap-1 xl:flex"
        >
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/memorial">Memorial</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">
              <Lock className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>
        </div>
      </div>

      <nav
        aria-label="Navegacao rapida"
        className="border-t border-border/40 xl:hidden"
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
