"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/data/db";

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

        let label = ROUTE_LABELS[segment];
        if (!label) {
          if (segment.startsWith("ord_")) {
            const order = db.state.orders.find((o) => o.id === segment);
            label = order ? order.orderNumber : segment;
          } else if (segment.startsWith("prod_")) {
            const prod = db.state.products.find((p) => p.id === segment);
            label = prod ? prod.name : segment;
          } else if (segment.startsWith("reel_")) {
            const reel = db.state.reels.find((r) => r.id === segment);
            label = reel ? `Reel #${reel.instagramPostId}` : segment;
          } else if (segment.startsWith("cust_")) {
            const customer = db.state.customers.find((c) => c.id === segment);
            label = customer ? customer.name : segment;
          } else if (segment.startsWith("auto_")) {
            const auto = db.state.automations.find((a) => a.id === segment);
            label = auto ? auto.name : segment;
          } else {
            label = segment;
          }
        }

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
            {isLast ? (
              <span
                suppressHydrationWarning
                className="font-semibold text-[#1E293B] truncate max-w-[200px]"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                suppressHydrationWarning
                className="hover:text-[#1E293B] transition-colors truncate max-w-[140px]"
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
