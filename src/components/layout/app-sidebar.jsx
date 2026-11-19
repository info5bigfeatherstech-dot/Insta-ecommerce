"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
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
    if (badgeKey === "ordersCount" && pendingOrdersCount > 0) return { value: pendingOrdersCount, urgent: false };
    if (badgeKey === "activeAutomationsCount") return { value: activeAutomationsCount, urgent: false };
    if (badgeKey === "unreadCount" && unreadMessagesCount > 0) return { value: unreadMessagesCount, urgent: true };
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
          "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border sidebar-transition select-none"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border shrink-0 bg-sidebar">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary text-primary-foreground shadow-xs">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-sidebar-text">
                  {SITE_CONFIG.name}
                </span>
                <span className="text-[10px] text-sidebar-icon truncate">
                  {SITE_CONFIG.storeName}
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-7 w-7 text-sidebar-icon hover:text-sidebar-text hover:bg-sidebar-hover"
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
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAVIGATION_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className={cn("px-3 mb-1.5", groupIndex > 0 ? "pt-2" : "")}>
                  {groupIndex > 0 && <div className="h-px bg-sidebar-border/60 mb-3" />}
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-sidebar-section">
                    {group.title}
                  </p>
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badgeInfo = getBadgeValue(item.badge);

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] h-10 px-3 text-[14px] font-medium transition-all duration-150 group relative",
                      isActive
                        ? "bg-sidebar-active text-sidebar-active-text font-semibold border border-sidebar-border shadow-xs"
                        : "text-sidebar-text hover:bg-sidebar-hover",
                      sidebarCollapsed && "justify-center px-0 w-10 mx-auto"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-sidebar-accent-bar" />
                    )}

                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors stroke-[1.75]",
                        isActive ? "text-sidebar-active-text" : "text-sidebar-icon group-hover:text-sidebar-text"
                      )}
                    />

                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate">{item.title}</span>
                        {badgeInfo !== null && (
                          <span
                            suppressHydrationWarning
                            className={cn(
                              "ml-auto h-5 min-w-[22px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums inline-flex items-center justify-center",
                              badgeInfo.urgent
                                ? "bg-sidebar-badge-active-bg text-sidebar-badge-active-text"
                                : "bg-sidebar-badge-bg text-sidebar-badge-text border border-sidebar-border/50"
                            )}
                          >
                            {badgeInfo.value}
                          </span>
                        )}
                      </>
                    )}

                    {sidebarCollapsed && badgeInfo !== null && (
                      <span
                        suppressHydrationWarning
                        className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sidebar-badge-active-bg"
                      />
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium text-xs">
                        {item.title} <span suppressHydrationWarning>{badgeInfo ? `(${badgeInfo.value})` : ""}</span>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href} className="my-0.5">{linkContent}</div>;
              })}
            </div>
          ))}
        </div>

        {/* User Profile Footer Card */}
        <div className="p-3 shrink-0 border-t border-sidebar-border bg-sidebar">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-[12px] p-2 bg-sidebar-profile-bg border border-sidebar-profile-border shadow-xs transition-colors",
              sidebarCollapsed && "justify-center p-1.5"
            )}
          >
            <Avatar className="h-9 w-9 shrink-0 border border-sidebar-border">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                {SITE_CONFIG.user.avatar}
              </AvatarFallback>
            </Avatar>

            {!sidebarCollapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-sidebar-text truncate leading-tight">
                  {SITE_CONFIG.user.name}
                </p>
                <p className="text-[10px] text-sidebar-icon truncate">
                  {SITE_CONFIG.user.role}
                </p>
              </div>
            )}

            {!sidebarCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-sidebar-icon hover:text-destructive rounded-[6px] hover:bg-sidebar-hover transition-colors"
                    aria-label="Log out"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Log out
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
