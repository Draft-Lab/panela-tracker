"use client"

import * as React from "react"
import Link from "next/link"
import { PanelaLogo } from "@/components/landing/panela-logo"
import {
  dashboardNavGroups,
  dashboardNavSecondary,
} from "@/components/dashboard/dashboard-nav-config"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-white/[0.08] bg-sidebar/95 backdrop-blur-xl"
      {...props}
    >
      <SidebarHeader className="border-b border-white/[0.06]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="h-auto px-3 py-4 data-[slot=sidebar-menu-button]:!p-3"
            >
              <Link href="/" className="hover:opacity-85">
                <PanelaLogo size="lg" className="shrink-0" />
                <div className="min-w-0 text-left leading-tight">
                  <span className="block truncate text-sm font-semibold tracking-tight">
                    Panela Tracker
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <NavMain groups={dashboardNavGroups} />
        <NavSecondary items={dashboardNavSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
