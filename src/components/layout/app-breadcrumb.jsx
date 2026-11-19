"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  create: "Create",
  new: "New workflow",
  customers: "Customers",
  inbox: "Inbox & DM Activity",
  tags: "Tags & Segments",
  analytics: "Analytics",
  reports: "Reports",
  settings: "Settings",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawSegments = pathname.split("/").filter(Boolean);

  if (rawSegments.length === 0) return null;

  // Build items array: { href, label, isLast }
  let items = [];

  const isAutomationDraft =
    rawSegments[0] === "automations" &&
    (rawSegments[1] === "new" ||
      (rawSegments[1] === "create" &&
        Boolean(searchParams?.get("template") || searchParams?.get("duplicate"))));

  if (isAutomationDraft) {
    const draftQuery = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    items = [
      { href: "/automations", label: "Automations", isLast: false },
      { href: "/automations/create", label: "Create", isLast: false },
      { href: `${pathname}${draftQuery}`, label: "New workflow", isLast: true },
    ];
  } else {
    items = rawSegments.map((segment, index) => {
      const href = `/${rawSegments.slice(0, index + 1).join("/")}`;
      const isLast = index === rawSegments.length - 1;

      let label = ROUTE_LABELS[segment];
      if (!label) {
        if (segment.startsWith("ord_")) {
          const order = db?.state?.orders?.find((o) => o.id === segment);
          label = order ? order.orderNumber : segment;
        } else if (segment.startsWith("prod_")) {
          const prod = db?.state?.products?.find((p) => p.id === segment);
          label = prod ? prod.name : segment;
        } else if (segment.startsWith("reel_")) {
          const reel = db?.state?.reels?.find((r) => r.id === segment);
          label = reel ? `Reel #${reel.instagramPostId}` : segment;
        } else if (segment.startsWith("cust_")) {
          const customer = db?.state?.customers?.find((c) => c.id === segment);
          label = customer ? customer.name : segment;
        } else if (segment.startsWith("auto_")) {
          const auto = db?.state?.automations?.find((a) => a.id === segment);
          label = auto ? auto.name : segment;
        } else {
          const auto = db?.state?.automations?.find((a) => a.id === segment);
          label = auto ? auto.name : segment;
        }
      }

      return { href, label, isLast };
    });
  }

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, index) => {
        return (
          <React.Fragment key={`${item.href}-${index}`}>
            <ChevronRight className="h-3.5 w-3.5 text-border" />
            {item.isLast ? (
              <span
                suppressHydrationWarning
                className="font-semibold text-foreground truncate max-w-[200px]"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                suppressHydrationWarning
                className="hover:text-foreground transition-colors truncate max-w-[140px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
