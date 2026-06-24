import {
  Home,
  Users,
  Gamepad2,
  ListChecks,
  LogOut,
  Dices,
  PlayCircle,
  Trophy,
  Calendar,
  Sparkles,
  Scale,
  type LucideIcon,
} from "lucide-react"

export type DashboardNavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Principal",
    items: [{ title: "Dashboard", url: "/dashboard", icon: Home }],
  },
  {
    label: "Jogos",
    items: [
      { title: "Jogos Atuais", url: "/dashboard/jogos-atuais", icon: PlayCircle },
      { title: "Temporadas", url: "/dashboard/temporadas", icon: Trophy },
      { title: "Jogos", url: "/dashboard/jogos", icon: Gamepad2 },
      { title: "Jogatinas", url: "/dashboard/jogatinas", icon: ListChecks },
      { title: "Calendário", url: "/dashboard/calendario", icon: Calendar },
    ],
  },
  {
    label: "Outros",
    items: [
      { title: "Jogadores", url: "/dashboard/jogadores", icon: Users },
      { title: "Roleta", url: "/dashboard/roleta", icon: Dices },
      { title: "Retrospectiva", url: "/dashboard/retrospectiva", icon: Sparkles },
      { title: "Auditoria de horas", url: "/dashboard/auditoria-horas", icon: Scale },
    ],
  },
]

export const dashboardNavSecondary: DashboardNavItem[] = [
  { title: "Sair", url: "#logout", icon: LogOut },
]
