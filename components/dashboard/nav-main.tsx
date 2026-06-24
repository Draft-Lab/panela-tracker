"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { DashboardNavGroup } from "@/components/dashboard/dashboard-nav-config"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navButtonClass =
  "rounded-xl data-[active=true]:bg-primary/12 data-[active=true]:font-medium data-[active=true]:text-primary"

interface NavMainProps {
  groups: DashboardNavGroup[]
}

export function NavMain({ groups }: NavMainProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={navButtonClass}
                  >
                    <Link href={item.url} onClick={closeMobile}>
                      <item.icon strokeWidth={1.75} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
