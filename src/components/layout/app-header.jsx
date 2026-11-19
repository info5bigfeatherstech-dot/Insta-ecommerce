"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Command,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Suspense } from "react";
import { AppBreadcrumb } from "./app-breadcrumb";
import { GlobalSearchDialog } from "./global-search-dialog";
import { ThemeToggle } from "./theme-toggle";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SITE_CONFIG } from "@/config/site-config";
import { toast } from "sonner";
import { db } from "@/data/db";

export function AppHeader() {
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const setGlobalSearchOpen = useUIStore((s) => s.setGlobalSearchOpen);

  const notifications = [
    {
      id: "notif_1",
      title: "New Reel Trigger: 'GOLD'",
      desc: "@priya_sharma_98 triggered Gold Necklace DM",
      time: "5m ago",
      href: "/reels/reel_1",
      unread: true,
    },
    {
      id: "notif_2",
      title: "Order #ORD-IN-1001 Paid",
      desc: "₹1,979 received via UPI (Priya Sharma)",
      time: "15m ago",
      href: "/orders/ord_1001",
      unread: true,
    },
    {
      id: "notif_3",
      title: "Stock Alert",
      desc: "Minimal Gold Vermeil Necklace stock low",
      time: "2h ago",
      href: "/products/prod_1",
      unread: false,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6 select-none">
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden h-8 w-8 text-foreground"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden sm:block">
            <Suspense fallback={null}>
              <AppBreadcrumb />
            </Suspense>
          </div>
        </div>

        {/* Right: Global Search Trigger, Notifications, Help, User Avatar Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <Button
            variant="outline"
            onClick={() => setGlobalSearchOpen(true)}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground gap-2 border-border bg-muted hidden sm:flex items-center"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Search anything...</span>
            <kbd className="pointer-events-none hidden h-4 select-none items-center gap-1 rounded bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border sm:flex">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGlobalSearchOpen(true)}
            className="sm:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Selector Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0 text-xs font-bold text-foreground">
                  Notifications
                </DropdownMenuLabel>
                <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-1 py-1">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    className="p-2 rounded-[6px] hover:bg-muted transition-colors cursor-pointer text-xs block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</p>
                  </Link>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full p-0 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="User profile"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {SITE_CONFIG.user.avatar}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              <div className="px-2.5 py-2">
                <p className="text-xs font-bold text-foreground">{SITE_CONFIG.user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{SITE_CONFIG.user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Store Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Simulated logout session")}
                className="flex items-center gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive-soft"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog />
    </>
  );
}
