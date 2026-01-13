"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Users, Gamepad2, ListChecks, Menu, X, LogOut, Dices, PlayCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth"

const navigationGroups = [
  {
    label: "Principal",
    items: [{ name: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    label: "Jogos",
    items: [
      { name: "Jogos Atuais", href: "/dashboard/jogos-atuais", icon: PlayCircle },
      { name: "Temporadas", href: "/dashboard/temporadas", icon: Trophy },
      { name: "Jogos", href: "/dashboard/jogos", icon: Gamepad2 },
      { name: "Jogatinas", href: "/dashboard/jogatinas", icon: ListChecks },
    ],
  },
  {
    label: "Outros",
    items: [
      { name: "Jogadores", href: "/dashboard/jogadores", icon: Users },
      { name: "Roleta", href: "/dashboard/roleta", icon: Dices },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-background">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="relative flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
            {/* Decorative corner lines */}
            <div className="absolute top-0 left-0 w-8 h-px bg-sidebar-primary/40" />
            <div className="absolute top-0 left-0 w-px h-8 bg-sidebar-primary/40" />
            <div className="absolute top-0 right-0 w-8 h-px bg-sidebar-primary/40" />
            <div className="absolute top-0 right-0 w-px h-8 bg-sidebar-primary/40" />

            <Link href="/" className="relative flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="p-2 rounded-md bg-sidebar-primary/10 border border-sidebar-primary/20">
                <Gamepad2 className="h-6 w-6 text-sidebar-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">Panela</h1>
                <p className="text-xs text-muted-foreground">Tracker</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navigationGroups.map((group, groupIndex) => (
              <div key={group.label} className="space-y-2">
                <div className="relative px-3 py-1.5">
                  {/* Decorative corner lines for group labels */}
                  <div className="absolute top-0 left-0 w-6 h-px bg-sidebar-primary/30" />
                  <div className="absolute top-0 left-0 w-px h-6 bg-sidebar-primary/30" />
                  <div className="absolute top-0 right-0 w-6 h-px bg-sidebar-primary/30" />
                  <div className="absolute top-0 right-0 w-px h-6 bg-sidebar-primary/30" />

                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </h3>
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                          "group",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {/* Decorative corner lines for active items */}
                        {isActive && (
                          <>
                            <div className="absolute top-0 left-0 w-4 h-px bg-sidebar-primary-foreground/40" />
                            <div className="absolute top-0 left-0 w-px h-4 bg-sidebar-primary-foreground/40" />
                            <div className="absolute top-0 right-0 w-4 h-px bg-sidebar-primary-foreground/40" />
                            <div className="absolute top-0 right-0 w-px h-4 bg-sidebar-primary-foreground/40" />
                            <div className="absolute bottom-0 left-0 w-4 h-px bg-sidebar-primary-foreground/40" />
                            <div className="absolute bottom-0 left-0 w-px h-4 bg-sidebar-primary-foreground/40" />
                            <div className="absolute bottom-0 right-0 w-4 h-px bg-sidebar-primary-foreground/40" />
                            <div className="absolute bottom-0 right-0 w-px h-4 bg-sidebar-primary-foreground/40" />
                          </>
                        )}

                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-sidebar-primary-foreground"
                              : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                          )}
                        />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer with Logout */}
          <div className="relative px-4 py-4 border-t border-sidebar-border space-y-4">
            {/* Decorative corner lines for footer */}
            <div className="absolute bottom-0 left-0 w-8 h-px bg-sidebar-primary/40" />
            <div className="absolute bottom-0 left-0 w-px h-8 bg-sidebar-primary/40" />
            <div className="absolute bottom-0 right-0 w-8 h-px bg-sidebar-primary/40" />
            <div className="absolute bottom-0 right-0 w-px h-8 bg-sidebar-primary/40" />

            <Button
              variant="outline"
              className="w-full justify-start bg-transparent hover:bg-sidebar-accent border-sidebar-border"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
            <p className="text-xs text-muted-foreground text-balance px-2">
              Acompanhe suas jogatinas e descubra quem mais dropa
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
