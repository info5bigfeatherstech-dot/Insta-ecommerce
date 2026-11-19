import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees (INR)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format numbers with Indian formatting or compact representation
 */
export function formatNumber(num, compact = false) {
  if (num === undefined || num === null || isNaN(num)) return "0";
  if (compact && Math.abs(num) >= 1000) {
    if (Math.abs(num) >= 10000000) {
      return (num / 10000000).toFixed(1) + "Cr";
    }
    if (Math.abs(num) >= 100000) {
      return (num / 100000).toFixed(1) + "L";
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
  }
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Safe date formatter
 */
export function formatDate(dateInput, formatPattern = "dd MMM yyyy, hh:mm a") {
  if (!dateInput) return "—";
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return format(date, formatPattern);
  } catch {
    return String(dateInput);
  }
}

/**
 * Relative time formatter (e.g. "5 minutes ago")
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "—";
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return String(dateInput);
  }
}

/**
 * Extract 1-2 initials from name or username
 */
export function getInitials(name = "") {
  if (!name) return "IC";
  const cleaned = name.replace(/[@#_.]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic color palette for avatars and placeholders
 */
const PALETTES = [
  { bg: "var(--palette-0-bg, #EEF2FF)", text: "var(--palette-0-text, #4F46E5)", border: "var(--palette-0-border, #C7D2FE)", accent: "var(--primary, #635BDB)", rawBg: "#EEF2FF", rawText: "#4F46E5" }, // Indigo
  { bg: "var(--palette-1-bg, #F0FDF4)", text: "var(--palette-1-text, #16A34A)", border: "var(--palette-1-border, #BBF7D0)", accent: "var(--success, #10B981)", rawBg: "#F0FDF4", rawText: "#16A34A" }, // Emerald
  { bg: "var(--palette-2-bg, #FFF7ED)", text: "var(--palette-2-text, #C2410C)", border: "var(--palette-2-border, #FED7AA)", accent: "var(--warning, #F97316)", rawBg: "#FFF7ED", rawText: "#C2410C" }, // Orange
  { bg: "var(--palette-3-bg, #EFF6FF)", text: "var(--palette-3-text, #2563EB)", border: "var(--palette-3-border, #BFDBFE)", accent: "var(--info, #3B82F6)", rawBg: "#EFF6FF", rawText: "#2563EB" }, // Blue
  { bg: "var(--palette-4-bg, #FAF5FF)", text: "var(--palette-4-text, #9333EA)", border: "var(--palette-4-border, #E9D5FF)", accent: "#A855F7", rawBg: "#FAF5FF", rawText: "#9333EA" }, // Purple
  { bg: "var(--palette-5-bg, #FFF1F2)", text: "var(--palette-5-text, #E11D48)", border: "var(--palette-5-border, #FECDD3)", accent: "var(--destructive, #F43F5E)", rawBg: "#FFF1F2", rawText: "#E11D48" }, // Rose
  { bg: "var(--palette-6-bg, #ECFEFF)", text: "var(--palette-6-text, #0891B2)", border: "var(--palette-6-border, #A5F3FC)", accent: "#06B6D4", rawBg: "#ECFEFF", rawText: "#0891B2" }, // Cyan
  { bg: "var(--palette-7-bg, #FEFCE8)", text: "var(--palette-7-text, #CA8A04)", border: "var(--palette-7-border, #FEF08A)", accent: "#EAB308", rawBg: "#FEFCE8", rawText: "#CA8A04" }, // Amber
];

export function getAvatarColor(identifier = "") {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Generate a clean SVG Data URL placeholder for products and Reels.
 * No external network requests; self-contained vector graphic.
 */
export function generateSVGPlaceholder({
  text = "Item",
  type = "product", // "product" | "reel" | "category"
  identifier = "",
  width = 200,
  height = 200,
}) {
  const palette = getAvatarColor(identifier || text);
  const initials = getInitials(text);
  const strokeColor = palette.rawText || palette.text;
  const bgColor = palette.rawBg || palette.bg;
  
  let iconSvg = "";
  if (type === "reel") {
    // Reel play icon
    iconSvg = `
      <rect x="35" y="30" width="30" height="40" rx="4" fill="none" stroke="${strokeColor}" stroke-width="2.5" />
      <polygon points="46,45 56,50 46,55" fill="${strokeColor}" />
    `;
  } else if (type === "category") {
    // Category grid icon
    iconSvg = `
      <rect x="36" y="36" width="12" height="12" rx="2" fill="${strokeColor}" opacity="0.8" />
      <rect x="52" y="36" width="12" height="12" rx="2" fill="${strokeColor}" opacity="0.4" />
      <rect x="36" y="52" width="12" height="12" rx="2" fill="${strokeColor}" opacity="0.4" />
      <rect x="52" y="52" width="12" height="12" rx="2" fill="${strokeColor}" opacity="0.8" />
    `;
  } else {
    // Product shopping bag icon
    iconSvg = `
      <path d="M35 40 L65 40 L62 64 L38 64 Z" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M43 40 C43 33 57 33 57 40" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">
    <rect width="100%" height="100%" fill="${bgColor}" rx="10" />
    <g transform="translate(0, -6)">
      ${iconSvg}
    </g>
    <text x="50" y="78" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="${strokeColor}" text-anchor="middle" letter-spacing="0.5">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Export array of records to downloadable CSV
 */
export function exportToCSV(filename, rows, columns) {
  if (!rows || !rows.length) return;
  const headerRow = columns.map((col) => `"${col.label || col.key}"`).join(",");
  const dataRows = rows.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (typeof col.format === "function") {
          val = col.format(val, row);
        }
        if (val === undefined || val === null) val = "";
        const cleanVal = String(val).replace(/"/g, '""');
        return `"${cleanVal}"`;
      })
      .join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...dataRows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
