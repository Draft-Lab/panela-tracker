"use client"

import type { ReactNode } from "react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { PanelaLogo } from "@/components/landing/panela-logo"

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-theme relative min-h-[100dvh]">
      <div className="landing-ambient" aria-hidden />
      <div className="landing-grain" aria-hidden />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative z-10 bg-transparent">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3 md:hidden">
            <SidebarTrigger className="size-9 shrink-0 rounded-full border border-white/10" />
            <PanelaLogo size="md" className="shrink-0" />
            <span className="text-sm font-semibold tracking-tight">
              Panela Tracker
            </span>
          </div>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
