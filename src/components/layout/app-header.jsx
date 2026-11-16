"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Command,
  User,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Suspense } from "react";
import { AppBreadcrumb } from "./app-breadcrumb";
import { GlobalSearchDialog } from "./global-search-dialog";
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
      unread: true,
    },
    {
      id: "notif_2",
      title: "Order #ORD-IN-1028 Paid",
      desc: "₹1,979 received via UPI (Priya Sharma)",
      time: "15m ago",
      unread: true,
    },
    {
      id: "notif_3",
      title: "Stock Alert",
      desc: "Chelsea Leather Boots stock down to 15 units",
      time: "2h ago",
      unread: false,
    },
  ];

  const handleHelp = () => {
    toast.info("Instagram Commerce Automation Engine — Documentation & Guides simulation");
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 md:px-6 select-none">
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden h-8 w-8 text-[#1E293B]"
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
            className="h-8 px-3 text-xs text-[#64748B] hover:text-[#1E293B] gap-2 border-[#E2E8F0] bg-[#F8FAFC] hidden sm:flex items-center"
          >
            <Search className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span>Search anything...</span>
            <kbd className="pointer-events-none hidden h-4 select-none items-center gap-1 rounded bg-white px-1.5 font-mono text-[10px] font-medium text-[#94A3B8] border border-[#E2E8F0] sm:flex">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGlobalSearchOpen(true)}
            className="sm:hidden h-8 w-8 text-[#64748B]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Connected Instagram Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{SITE_CONFIG.instagramHandle}</span>
          </div>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#64748B] hover:text-[#1E293B] relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#635BDB]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0 text-xs font-bold text-[#1E293B]">
                  Notifications
                </DropdownMenuLabel>
                <span className="text-[10px] text-[#635BDB] font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-1 py-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded-[6px] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1E293B]">{n.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHelp}
            className="h-8 w-8 text-[#64748B] hover:text-[#1E293B]"
            title="Help & Knowledge Base"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full p-0 ring-offset-white focus-visible:ring-2 focus-visible:ring-[#635BDB]"
                aria-label="User profile"
              >
                <Avatar className="h-8 w-8 border border-[#E2E8F0]">
                  <AvatarFallback className="bg-[#635BDB] text-white text-xs font-bold">
                    {SITE_CONFIG.user.avatar}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              <div className="px-2.5 py-2">
                <p className="text-xs font-bold text-[#1E293B]">{SITE_CONFIG.user.name}</p>
                <p className="text-[11px] text-[#64748B] truncate">{SITE_CONFIG.user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                  <User className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                  <Settings className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>Store Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/integrations" className="flex items-center gap-2 cursor-pointer text-xs">
                  <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>Integrations</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Simulated logout session")}
                className="flex items-center gap-2 cursor-pointer text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
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
