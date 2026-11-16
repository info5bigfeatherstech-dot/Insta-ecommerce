"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const ROUTE_LABELS = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  categories: "Categories",
  reels: "Reels & Posts",
  automations: "Automations",
  create: "Create Workflow",
  customers: "Customers",
  inbox: "Inbox & DM Activity",
  tags: "Tags & Segments",
  analytics: "Analytics",
  reports: "Reports",
  integrations: "Integrations",
  settings: "Settings",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-[#64748B]">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-[#1E293B] transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = ROUTE_LABELS[segment] || (segment.startsWith("cust_") || segment.startsWith("auto_") ? `Details (${segment})` : segment);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
            {isLast ? (
              <span className="font-semibold text-[#1E293B] truncate max-w-[150px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-[#1E293B] transition-colors truncate max-w-[120px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
