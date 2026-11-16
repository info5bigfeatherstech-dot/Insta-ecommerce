"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LogOut, Settings as SettingsIcon } from "lucide-react";
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
    if (badgeKey === "ordersCount" && pendingOrdersCount > 0) return pendingOrdersCount;
    if (badgeKey === "activeAutomationsCount") return activeAutomationsCount;
    if (badgeKey === "unreadCount" && unreadMessagesCount > 0) return unreadMessagesCount;
    return null;
  };

  const handleLinkClick = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="p-0 w-72 flex flex-col justify-between">
        <SheetHeader className="p-4 border-b border-[#E2E8F0]">
          <SheetTitle className="flex items-center gap-2.5 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#635BDB] text-white">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">{SITE_CONFIG.name}</p>
              <p className="text-[10px] text-[#64748B] font-normal">{SITE_CONFIG.storeName}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badge = getBadgeValue(item.badge);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-[8px] px-3 py-2 text-xs font-medium transition-all",
                      isActive
                        ? "bg-[#EEF2FF] text-[#635BDB] font-semibold"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-[#635BDB]" : "text-[#64748B]")} />
                    <span>{item.title}</span>
                    {badge !== null && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          isActive ? "bg-[#635BDB] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="border-t border-[#E2E8F0] p-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-[#E2E8F0]">
              <AvatarFallback className="bg-[#635BDB] text-white font-bold text-xs">
                {SITE_CONFIG.user.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-[#1E293B]">{SITE_CONFIG.user.name}</p>
              <p className="text-[10px] text-[#64748B]">{SITE_CONFIG.user.role}</p>
            </div>
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="p-1.5 text-[#64748B] hover:text-[#1E293B] rounded-[6px] hover:bg-white border border-transparent hover:border-[#E2E8F0]"
            >
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
