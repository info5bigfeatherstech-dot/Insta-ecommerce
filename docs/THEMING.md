# Instagram Commerce Automation Admin Dashboard — Theming Guide

This document describes the design token architecture, theme switcher mechanics, chart theming, automation canvas theming, and contributor guidelines for maintaining theme consistency across the platform.

---

## 1. Architecture Overview

The theming system supports three modes: **Light**, **Dark**, and **System** (which follows the OS preference via `prefers-color-scheme`).

- **Theme Engine**: Powered by `next-themes` using CSS class strategy (`attribute="class"`).
- **Storage**: LocalStorage key `instacommerce-theme`.
- **CSS Framework**: Tailwind CSS v4 using semantic utility classes (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, etc.).
- **Tailwind v4 Variant**: `@custom-variant dark (&:is(.dark *));` declared in `src/app/globals.css`.
- **Hydration Safe**: `app/layout.js` uses `<html lang="en" suppressHydrationWarning>` to prevent hydration mismatch flashes between server and client theme resolution.

---

## 2. Design Tokens Reference

All design tokens are defined as CSS custom properties in [src/app/globals.css](file:///d:/bot_dashboard/src/app/globals.css) and exposed through Tailwind's `@theme` directive, mirrored in [src/styles/theme.js](file:///d:/bot_dashboard/src/styles/theme.js).

### 2.1 Surfaces & Typography

| Token | Light Value | Dark Value (`.dark`) | Tailwind Class |
| :--- | :--- | :--- | :--- |
| `--background` | `#F8FAFC` | `#0F1117` | `bg-background` |
| `--foreground` | `#1E293B` | `#E6E8EF` | `text-foreground` |
| `--card` | `#FFFFFF` | `#161A23` | `bg-card`, `text-card-foreground` |
| `--popover` | `#FFFFFF` | `#161A23` | `bg-popover`, `text-popover-foreground` |
| `--muted` | `#F8FAFC` | `#1C2130` | `bg-muted` |
| `--muted-foreground` | `#64748B` | `#9AA3B5` | `text-muted-foreground` |
| `--border` | `#E2E8F0` | `#262B38` | `border-border` |
| `--input` | `#E2E8F0` | `#262B38` | `border-input` |
| `--ring` | `#635BDB` | `#7C74F0` | `ring-ring` |

### 2.2 Brand & Status Tokens

| Token | Light Value | Dark Value (`.dark`) | Semantic Use |
| :--- | :--- | :--- | :--- |
| `--primary` | `#635BDB` | `#7C74F0` | Primary brand buttons, links, accents |
| `--primary-foreground`| `#FFFFFF` | `#FFFFFF` | Text on primary buttons |
| `--primary-hover` | `#5349C9` | `#6B62E8` | Hover state for primary buttons |
| `--primary-soft` | `#EEF2FF` | `rgba(124, 116, 240, 0.15)` | Primary badge background |
| `--destructive` | `#EF4444` | `#F87171` | Delete, drop, error actions |
| `--destructive-soft` | `#FEF2F2` | `rgba(248, 113, 113, 0.15)` | Destructive badges/banners |
| `--success` | `#10B981` | `#34D399` | Delivered, completed, active states |
| `--success-soft` | `#ECFDF5` | `rgba(52, 211, 153, 0.15)` | Success badges |
| `--warning` | `#F59E0B` | `#FBBF24` | Paused, pending, attention states |
| `--warning-soft` | `#FFFBEB` | `rgba(251, 191, 36, 0.15)` | Warning badges |
| `--info` | `#3B82F6` | `#60A5FA` | Information callouts |
| `--info-soft` | `#EFF6FF` | `rgba(96, 165, 250, 0.15)` | Info badges |

### 2.3 Medium Lavender Sidebar Tokens

The sidebar maintains a distinctive lavender personality across expanded, collapsed, and mobile drawer states:

| Sidebar Token | Light Mode | Dark Mode (`.dark`) | Description |
| :--- | :--- | :--- | :--- |
| `--sidebar-bg` | `#D9D5F5` | `#14172A` | Sidebar container background |
| `--sidebar-border` | `#C6C1EC` | `#1F243B` | Right edge divider border |
| `--sidebar-text` | `#34385F` | `#C5C9E0` | Inactive nav item label |
| `--sidebar-icon` | `#555A86` | `#8E95BC` | Inactive nav item icon |
| `--sidebar-section-label` | `#5A5E87` | `#7178A3` | Section headings (`OVERVIEW`, `ECOMMERCE`) |
| `--sidebar-hover` | `#CDC8F0` | `#1B1F38` | Hover background row |
| `--sidebar-active-bg` | `#FFFFFF` | `#1F2340` | Active item pill background |
| `--sidebar-active-text` | `#635BDB` | `#A59EF8` | Active item label & icon |
| `--sidebar-accent-bar` | `#635BDB` | `#7C74F0` | Left vertical accent bar on active row |
| `--sidebar-badge-bg` | `#FFFFFF` | `#2A2F50` | Standard badge pill background |
| `--sidebar-badge-text` | `#635BDB` | `#A59EF8` | Standard badge pill text |

### 2.4 Automation Editor Canvas Tokens

The `@xyflow/react` node workflow canvas uses dedicated canvas variables:

| Canvas Token | Light Mode | Dark Mode (`.dark`) | Description |
| :--- | :--- | :--- | :--- |
| `--canvas-bg` | `#FFFFFF` | `#0B0D13` | Canvas background |
| `--canvas-dots` | `#CBD5E1` | `#262B38` | Background dot grid |
| `--canvas-node-bg` | `#FFFFFF` | `#161A23` | App node body background |
| `--canvas-node-border` | `#E2E8F0` | `#262B38` | App node outer border |
| `--canvas-node-text` | `#1E293B` | `#E6E8EF` | App node main label text |
| `--canvas-node-subtitle`| `#64748B` | `#9AA3B5` | App node subtext / keyword note |
| `--canvas-edge-default` | `#94A3B8` | `#475569` | Default connecting bezier edge |
| `--canvas-edge-selected`| `#635BDB` | `#7C74F0` | Selected / active connecting edge |

---

## 3. Specialized Component Integrations

### 3.1 Recharts Chart Theming (`useChartTheme`)

Recharts SVG elements require actual color values (hex or rgba) rather than CSS custom property names because SVG attributes like `stroke` and `fill` are calculated dynamically during graph interpolation.

Use the `useChartTheme()` hook in [src/hooks/use-chart-theme.js](file:///d:/bot_dashboard/src/hooks/use-chart-theme.js):

```jsx
import { useChartTheme } from "@/hooks/use-chart-theme";

export function SalesChart() {
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
        <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.tooltipBorder,
            color: chartTheme.tooltipText,
            borderRadius: 8,
          }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke={chartTheme.colors.chart1}
          fill={chartTheme.colors.chart1}
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### 3.2 Automation Flow Canvas (`@xyflow/react`)

The automation editor in `src/components/automations/editor/workflow-canvas.jsx` dynamically adapts to theme changes:
1. `colorMode={isDark ? "dark" : "light"}` is bound to React Flow.
2. Background grid uses `color="var(--canvas-dots)"` and `bgColor="var(--canvas-bg)"`.
3. Sticky notes support sticky color themes with high contrast text in dark mode.
4. Edge action buttons and floating toolbars use `bg-popover text-popover-foreground border-border`.

---

## 4. Contributor Rules & Guardrails

To prevent theme regressions when creating new features or pages:

1. **NEVER use raw hex codes in JSX**:
   - ❌ Bad: `<div className="text-[#1E293B] border-[#E2E8F0]">`
   - ✅ Good: `<div className="text-foreground border-border">`

2. **NEVER use fixed Tailwind color classes**:
   - ❌ Bad: `<div className="bg-white text-slate-800 border-gray-200">`
   - ✅ Good: `<div className="bg-card text-card-foreground border-border">`

3. **Use semantic status tokens for alerts and badges**:
   - ❌ Bad: `<span className="bg-green-100 text-green-700">Active</span>`
   - ✅ Good: `<span className="bg-success-soft text-success">Active</span>`

4. **Run the automated color checker before committing**:
   ```bash
   npm run check:colors
   ```
   This will fail with exit code `1` if any hardcoded colors or fixed Tailwind utilities are introduced outside approved directories (`src/data/*`).
