/**
 * Design System Theme Tokens
 * All hex codes and design tokens are defined here and in globals.css CSS variables.
 * Components must consume classes or theme variables, never hardcode hex values.
 */

export const THEME = {
  colors: {
    background: "#F8FAFC",
    sidebar: "#FFFFFF",
    card: "#FFFFFF",
    cardForeground: "#1E293B",
    primary: "#635BDB",
    primaryForeground: "#FFFFFF",
    primaryLight: "#EEF2FF",
    primaryHover: "#5349C9",
    text: "#1E293B",
    secondaryText: "#64748B",
    mutedText: "#94A3B8",
    border: "#E2E8F0",
    input: "#E2E8F0",
    success: "#10B981",
    successLight: "#ECFDF5",
    warning: "#F59E0B",
    warningLight: "#FFFBEB",
    error: "#EF4444",
    errorLight: "#FEF2F2",
    info: "#3B82F6",
    infoLight: "#EFF6FF",
  },
  radius: {
    card: "12px", // 10-14px as specified
    button: "8px",
    badge: "6px",
    input: "8px",
  },
  typography: {
    fontFamily: "var(--font-manrope), sans-serif",
  },
  shadows: {
    card: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
    dropdown: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
  },
};

export default THEME;
