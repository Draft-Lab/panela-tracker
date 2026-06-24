"use client"

import { useRouter } from "next/navigation"
import type { DashboardNavItem } from "@/components/dashboard/dashboard-nav-config"
import { logout } from "@/lib/auth"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface NavSecondaryProps {
  items: DashboardNavItem[]
  className?: string
}

export function NavSecondary({ items, className }: NavSecondaryProps) {
  const router = useRouter()

  async function handleAction(item: DashboardNavItem) {
    if (item.url === "#logout") {
      await logout()
      router.push("/")
    }
  }

  return (
    <SidebarGroup className={cn(className)}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => handleAction(item)}
                className="rounded-xl text-muted-foreground hover:text-foreground"
              >
                <item.icon strokeWidth={1.75} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
