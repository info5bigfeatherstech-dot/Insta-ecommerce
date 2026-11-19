"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  // Resolved hex values for places where SVG CSS vars might not be supported (e.g. Canvas or certain Tooltip styles)
  const resolved = React.useMemo(() => {
    if (isDark) {
      return {
        chart1: "#8B84F5",
        chart2: "#60A5FA",
        chart3: "#34D399",
        chart4: "#FBBF24",
        chart5: "#F472B6",
        chart6: "#94A3B8",
        grid: "#262B38",
        text: "#9AA3B5",
        tooltipBg: "#161A23",
        tooltipBorder: "#262B38",
        tooltipText: "#E6E8EF",
      };
    }
    return {
      chart1: "#635BDB",
      chart2: "#3B82F6",
      chart3: "#10B981",
      chart4: "#F59E0B",
      chart5: "#EC4899",
      chart6: "#8B5CF6",
      grid: "#E2E8F0",
      text: "#94A3B8",
      tooltipBg: "#FFFFFF",
      tooltipBorder: "#E2E8F0",
      tooltipText: "#1E293B",
    };
  }, [isDark]);

  return {
    mounted,
    isDark,
    tokens: {
      chart1: "var(--chart-1)",
      chart2: "var(--chart-2)",
      chart3: "var(--chart-3)",
      chart4: "var(--chart-4)",
      chart5: "var(--chart-5)",
      chart6: "var(--chart-6)",
      grid: "var(--border)",
      text: "var(--muted-foreground)",
      tooltipBg: "var(--card)",
      tooltipBorder: "var(--border)",
      tooltipText: "var(--card-foreground)",
    },
    resolved,
    tooltipContentStyle: {
      backgroundColor: resolved.tooltipBg,
      borderColor: resolved.tooltipBorder,
      color: resolved.tooltipText,
      borderRadius: "8px",
      fontSize: "12px",
      boxShadow: isDark
        ? "0 4px 6px -1px rgb(0 0 0 / 0.5)"
        : "0 4px 6px -1px rgb(0 0 0 / 0.08)",
    },
    tooltipItemStyle: {
      color: resolved.tooltipText,
    },
    tooltipLabelStyle: {
      color: resolved.tooltipText,
      fontWeight: 600,
    },
  };
}
