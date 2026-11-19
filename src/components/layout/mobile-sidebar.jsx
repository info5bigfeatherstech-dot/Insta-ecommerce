"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { SITE_CONFIG } from "@/config/site-config";
import { useUIStore } from "@/store/ui-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { db } from "@/data/db";

export function MobileSidebar() {
  const pathname = usePathname();
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);

  const pendingOrdersCount = db.state.orders.filter((o) => o.fulfillmentStatus === "pending").length;
  const activeAutomationsCount = db.state.automations.filter((a) => a.status === "active").length;
  const unreadMessagesCount = db.state.conversations.filter((c) => c.unread).length;

  const getBadgeValue = (badgeKey) => {
    if (badgeKey === "ordersCount" && pendingOrdersCount > 0) return { value: pendingOrdersCount, urgent: false };
    if (badgeKey === "activeAutomationsCount") return { value: activeAutomationsCount, urgent: false };
    if (badgeKey === "unreadCount" && unreadMessagesCount > 0) return { value: unreadMessagesCount, urgent: true };
    return null;
  };

  const handleLinkClick = () => {
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    toast.info("Logged out from simulated session.");
  };

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="p-0 w-72 flex flex-col justify-between bg-sidebar border-r border-sidebar-border text-sidebar-text">
        <SheetHeader className="p-4 border-b border-sidebar-border bg-sidebar">
          <SheetTitle className="flex items-center gap-2.5 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary text-primary-foreground shadow-xs">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-text">{SITE_CONFIG.name}</p>
              <p className="text-[10px] text-sidebar-icon font-normal">{SITE_CONFIG.storeName}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {NAVIGATION_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className="space-y-0.5">
              <div className={cn("px-3 mb-1.5", groupIndex > 0 ? "pt-2" : "")}>
                {groupIndex > 0 && <div className="h-px bg-sidebar-border/60 mb-3" />}
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-sidebar-section">
                  {group.title}
                </p>
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badgeInfo = getBadgeValue(item.badge);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] h-10 px-3 text-[14px] font-medium transition-all duration-150 group relative my-0.5",
                      isActive
                        ? "bg-sidebar-active text-sidebar-active-text font-semibold border border-sidebar-border shadow-xs"
                        : "text-sidebar-text hover:bg-sidebar-hover"
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
                    <span>{item.title}</span>
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
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer Card */}
        <div className="p-3 shrink-0 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center gap-2.5 rounded-[12px] p-2 bg-sidebar-profile-bg border border-sidebar-profile-border shadow-xs">
            <Avatar className="h-9 w-9 shrink-0 border border-sidebar-border">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                {SITE_CONFIG.user.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-sidebar-text truncate leading-tight">
                {SITE_CONFIG.user.name}
              </p>
              <p className="text-[10px] text-sidebar-icon truncate">
                {SITE_CONFIG.user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-sidebar-icon hover:text-destructive rounded-[6px] hover:bg-sidebar-hover transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
