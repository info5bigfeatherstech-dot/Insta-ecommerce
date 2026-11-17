"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/store/ui-store";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { db } from "@/data/db";
import {
  LayoutDashboard,
  Users,
  Package,
  Film,
  Zap,
  ShoppingBag,
} from "lucide-react";

export function GlobalSearchDialog() {
  const router = useRouter();
  const globalSearchOpen = useUIStore((s) => s.globalSearchOpen);
  const setGlobalSearchOpen = useUIStore((s) => s.setGlobalSearchOpen);

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setGlobalSearchOpen(!globalSearchOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  const handleSelect = (callback) => {
    setGlobalSearchOpen(false);
    callback();
  };

  return (
    <CommandDialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen}>
      <CommandInput placeholder="Search pages, customers, products, reels, orders... (Cmd+K)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation Pages */}
        <CommandGroup heading="Navigation">
          {NAVIGATION_GROUPS.flatMap((g) => g.items).map((item) => {
            const Icon = item.icon || LayoutDashboard;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(() => router.push(item.href))}
                className="gap-2.5"
              >
                <Icon className="h-4 w-4 text-[#635BDB]" />
                <span>{item.title}</span>
                <span className="ml-auto text-[10px] text-[#94A3B8]">{item.href}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Orders */}
        <CommandGroup heading="Recent Orders">
          {db.state.orders.slice(0, 5).map((ord) => (
            <CommandItem
              key={ord.id}
              onSelect={() => handleSelect(() => router.push(`/orders/${ord.id}`))}
              className="gap-2.5"
            >
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>{ord.orderNumber}</span>
              <span className="text-[11px] text-[#64748B]">{ord.customerName}</span>
              <span className="ml-auto text-[10px] font-bold text-[#1E293B]">
                ₹{ord.totalAmount.toLocaleString("en-IN")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Customers */}
        <CommandGroup heading="Customers">
          {db.state.customers.slice(0, 5).map((cust) => (
            <CommandItem
              key={cust.id}
              onSelect={() => handleSelect(() => router.push(`/customers/${cust.id}`))}
              className="gap-2.5"
            >
              <Users className="h-4 w-4 text-emerald-600" />
              <span>{cust.name}</span>
              <span className="text-[11px] text-[#64748B]">{cust.username}</span>
              <span className="ml-auto text-[10px] text-[#94A3B8]">{cust.city}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Products */}
        <CommandGroup heading="Products">
          {db.state.products.slice(0, 5).map((prod) => (
            <CommandItem
              key={prod.id}
              onSelect={() => handleSelect(() => router.push(`/products/${prod.id}`))}
              className="gap-2.5"
            >
              <Package className="h-4 w-4 text-amber-600" />
              <span>{prod.name}</span>
              <span className="ml-auto text-[11px] font-medium text-[#1E293B]">
                ₹{prod.price.toLocaleString("en-IN")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Reels & Posts */}
        <CommandGroup heading="Reels & Comment Triggers">
          {db.state.reels.slice(0, 5).map((reel) => (
            <CommandItem
              key={reel.id}
              onSelect={() => handleSelect(() => router.push(`/reels/${reel.id}`))}
              className="gap-2.5"
            >
              <Film className="h-4 w-4 text-rose-500" />
              <span className="truncate max-w-[220px]">{reel.caption}</span>
              <span className="ml-auto text-[10px] text-[#635BDB] font-medium">
                {reel.instagramPostId}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Automations */}
        <CommandGroup heading="Automations">
          {db.state.automations.slice(0, 4).map((auto) => (
            <CommandItem
              key={auto.id}
              onSelect={() => handleSelect(() => router.push(`/automations/${auto.id}`))}
              className="gap-2.5"
            >
              <Zap className="h-4 w-4 text-indigo-500" />
              <span>{auto.name}</span>
              <span className="ml-auto text-[10px] text-[#64748B]">{auto.executions} runs</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
