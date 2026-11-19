"use client";

import { useState, useEffect, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/query-client";
import { usePreferenceStore } from "@/store/preference-store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationDepthTracker } from "@/hooks/use-smart-back";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "var(--font-manrope), sans-serif",
          borderRadius: "10px",
        },
      }}
    />
  );
}

export default function Providers({ children }) {
  const [queryClientInstance] = useState(() => createQueryClient());
  const initFromStorage = usePreferenceStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="instacommerce-theme"
    >
      <QueryClientProvider client={queryClientInstance}>
        <Suspense fallback={null}>
          <NavigationDepthTracker />
        </Suspense>
        <TooltipProvider delayDuration={150}>
          {children}
        </TooltipProvider>
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
