"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/query-client";
import { usePreferenceStore } from "@/store/preference-store";

export default function Providers({ children }) {
  const [queryClientInstance] = useState(() => createQueryClient());
  const initFromStorage = usePreferenceStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <QueryClientProvider client={queryClientInstance}>
      {children}
      <Toaster
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
    </QueryClientProvider>
  );
}
