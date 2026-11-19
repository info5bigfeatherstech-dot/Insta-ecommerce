"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

function AdminMain({ children }) {
  const pathname = usePathname();
  const isCanvasPage =
    pathname === "/automations/create" ||
    (pathname?.startsWith("/automations/") && pathname !== "/automations");

  return (
    <main
      className={cn(
        "flex-1 w-full flex flex-col",
        isCanvasPage ? "p-0 max-w-none" : "p-4 md:p-6 max-w-7xl mx-auto"
      )}
    >
      {children}
    </main>
  );
}

export default function AdminLayout({ children }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Desktop Fixed Sidebar */}
      <Suspense fallback={<aside className="fixed inset-y-0 left-0 z-30 hidden md:flex w-[250px] bg-sidebar border-r border-sidebar-border" />}>
        <AppSidebar />
      </Suspense>

      {/* Mobile Drawer Sidebar */}
      <Suspense fallback={null}>
        <MobileSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col flex-1 min-h-screen sidebar-transition",
          sidebarCollapsed ? "md:pl-[68px]" : "md:pl-[250px]"
        )}
      >
        <Suspense fallback={<header className="sticky top-0 z-20 h-16 w-full border-b border-border bg-card" />}>
          <AppHeader />
        </Suspense>

        <Suspense fallback={<main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto" />}>
          <AdminMain>{children}</AdminMain>
        </Suspense>
      </div>
    </div>
  );
}
