"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
} from "lucide-react";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { SITE_CONFIG } from "@/config/site-config";
import { useUIStore } from "@/store/ui-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { db } from "@/data/db";

export function AppSidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  // Dynamic counts for sidebar badges
  const pendingOrdersCount = db.state.orders.filter((o) => o.fulfillmentStatus === "pending").length;
  const activeAutomationsCount = db.state.automations.filter((a) => a.status === "active").length;
  const unreadMessagesCount = db.state.conversations.filter((c) => c.unread).length;

  const getBadgeValue = (badgeKey) => {
    if (badgeKey === "ordersCount" && pendingOrdersCount > 0) return pendingOrdersCount;
    if (badgeKey === "activeAutomationsCount") return activeAutomationsCount;
    if (badgeKey === "unreadCount" && unreadMessagesCount > 0) return unreadMessagesCount;
    return null;
  };

  const handleLogout = () => {
    toast.info("Logged out from simulated session.");
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        style={{ width: sidebarCollapsed ? "var(--sidebar-collapsed-width, 68px)" : "var(--sidebar-width, 250px)" }}
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-white border-r border-[#E2E8F0] sidebar-transition select-none"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#E2E8F0] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#635BDB] text-white shadow-xs">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-[#1E293B]">
                  {SITE_CONFIG.name}
                </span>
                <span className="text-[10px] text-[#64748B] truncate">
                  {SITE_CONFIG.storeName}
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-7 w-7 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badge = getBadgeValue(item.badge);

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-[8px] px-3 py-2 text-xs font-medium transition-all group relative",
                      isActive
                        ? "bg-[#EEF2FF] text-[#635BDB] font-semibold"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]",
                      sidebarCollapsed && "justify-center px-0 py-2.5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-[#635BDB]" : "text-[#64748B] group-hover:text-[#1E293B]"
                      )}
                    />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate">{item.title}</span>
                        {badge !== null && (
                          <span
                            suppressHydrationWarning
                            className={cn(
                              "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                              isActive
                                ? "bg-[#635BDB] text-white"
                                : "bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#E2E8F0]"
                            )}
                          >
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium text-xs">
                        {item.title} <span suppressHydrationWarning>{badge ? `(${badge})` : ""}</span>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-[#E2E8F0] p-3 shrink-0 bg-white">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-[8px] p-2 hover:bg-[#F8FAFC] transition-colors",
              sidebarCollapsed && "justify-center p-0"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 border border-[#E2E8F0]">
              <AvatarFallback className="bg-[#635BDB] text-white font-bold text-xs">
                {SITE_CONFIG.user.avatar}
              </AvatarFallback>
            </Avatar>

            {!sidebarCollapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-[#1E293B] truncate leading-tight">
                  {SITE_CONFIG.user.name}
                </p>
                <p className="text-[10px] text-[#64748B] truncate">
                  {SITE_CONFIG.user.role}
                </p>
              </div>
            )}

            {!sidebarCollapsed && (
              <div className="flex items-center gap-1">
                <Link
                  href="/settings"
                  className="p-1 text-[#64748B] hover:text-[#1E293B] rounded-[4px] hover:bg-[#F1F5F9]"
                  title="Store Settings"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1 text-[#64748B] hover:text-red-600 rounded-[4px] hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
