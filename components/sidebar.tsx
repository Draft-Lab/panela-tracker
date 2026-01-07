"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Users, Gamepad2, ListChecks, Menu, X, LogOut, Dices, PlayCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Jogos Atuais", href: "/dashboard/jogos-atuais", icon: PlayCircle },
  { name: "Temporadas", href: "/dashboard/temporadas", icon: Trophy },
  { name: "Jogadores", href: "/dashboard/jogadores", icon: Users },
  { name: "Jogos", href: "/dashboard/jogos", icon: Gamepad2 },
  { name: "Jogatinas", href: "/dashboard/jogatinas", icon: ListChecks },
  { name: "Roleta", href: "/dashboard/roleta", icon: Dices },
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
          <div className="flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
            <Gamepad2 className="h-8 w-8 text-sidebar-primary" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">Panela</h1>
              <p className="text-xs text-muted-foreground">Tracker</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
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
