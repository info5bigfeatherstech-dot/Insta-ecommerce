"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { create } from "zustand";

/**
 * Navigation History Store
 * Tracks in-app navigation count within the current tab session.
 * Does not rely on fragile window.history.length.
 */
export const useNavigationHistoryStore = create((set) => ({
  inAppHistoryCount: 0,
  increment: () =>
    set((state) => ({ inAppHistoryCount: state.inAppHistoryCount + 1 })),
  decrement: () =>
    set((state) => ({ inAppHistoryCount: Math.max(0, state.inAppHistoryCount - 1) })),
  reset: () => set({ inAppHistoryCount: 0 }),
  setCount: (count) => set({ inAppHistoryCount: count }),
}));

/**
 * Global Navigation Depth Tracker Component
 * Mounted once inside Providers. Listens to route transitions and popstate
 * to keep in-app navigation count accurate.
 */
export function NavigationDepthTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevUrlRef = React.useRef(null);
  const isPopState = React.useRef(false);

  React.useEffect(() => {
    const handlePopState = () => {
      isPopState.current = true;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  React.useEffect(() => {
    const qs = searchParams?.toString();
    const currentUrl = pathname + (qs ? `?${qs}` : "");

    // First mount
    if (prevUrlRef.current === null) {
      prevUrlRef.current = currentUrl;
      const isReload =
        typeof performance !== "undefined" &&
        performance.getEntriesByType("navigation")?.[0]?.type === "reload";

      if (isReload) {
        try {
          sessionStorage.setItem("__app_nav_count", "0");
        } catch {}
        useNavigationHistoryStore.getState().reset();
      } else {
        try {
          const sessionCount = parseInt(
            sessionStorage.getItem("__app_nav_count") || "0",
            10
          );
          useNavigationHistoryStore.setState({ inAppHistoryCount: sessionCount });
        } catch {
          useNavigationHistoryStore.getState().reset();
        }
      }
      return;
    }

    // Skip if URL didn't actually change
    if (prevUrlRef.current === currentUrl) return;
    prevUrlRef.current = currentUrl;

    if (isPopState.current) {
      isPopState.current = false;
      useNavigationHistoryStore.getState().decrement();
    } else {
      useNavigationHistoryStore.getState().increment();
    }

    try {
      const count = useNavigationHistoryStore.getState().inAppHistoryCount;
      sessionStorage.setItem("__app_nav_count", String(count));
    } catch {}
  }, [pathname, searchParams]);

  return null;
}

/**
 * useSmartBack Hook
 * @param {string} fallbackHref - The destination route if user arrived directly
 * @returns {{ smartBack: () => void, canGoBack: boolean, fallbackHref: string }}
 */
export function useSmartBack(fallbackHref = "/automations") {
  const router = useRouter();
  const inAppHistoryCount = useNavigationHistoryStore((s) => s.inAppHistoryCount);

  const smartBack = React.useCallback(() => {
    if (inAppHistoryCount > 0) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [inAppHistoryCount, router, fallbackHref]);

  return {
    smartBack,
    canGoBack: inAppHistoryCount > 0,
    fallbackHref,
  };
}
