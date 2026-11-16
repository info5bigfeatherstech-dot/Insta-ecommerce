# Instagram Commerce Automation Admin Dashboard (Converto)

A complete, production-quality, frontend-only B2B SaaS Admin Dashboard built with Next.js App Router, Tailwind CSS, Radix UI, TanStack Query, and Zustand.

Designed for modern direct-to-consumer (D2C) brands operating high-volume automated Instagram DM funnels, product drops, and conversational commerce in India (INR currency, realistic Indian handles, catalog, and order data).

---

## 🚀 Key Highlights & Architectural Features

- **Frontend-Only Simulated Architecture**: Powered by a centralized mock database (`src/data/db.js`) with realistic async latency (300–600ms), referential integrity across all entities, and local storage persistence. Swapping to real APIs requires changes to `src/services/*` only.
- **Strict JavaScript (ES6+ / JSX)**: 100% JavaScript, zero TypeScript files.
- **Custom Design System**:
  - Palette: Light theme only (`#635BDB` primary indigo, `#F8FAFC` page canvas, `#FFFFFF` cards, `#E2E8F0` borders, `#1E293B` text).
  - Configured via CSS variables in `src/app/globals.css` and tokens in `src/styles/theme.js` (no hardcoded hex codes in components).
  - Typography: Google Font `Manrope` loaded via `next/font/google`.
  - Dynamic Table Density: Change between `compact`, `normal`, and `comfortable` padding app-wide from Settings, dynamically applied to `DataTable`.
  - Self-contained SVG placeholders & avatar initials generator (zero external/broken image URLs).
- **Navigation & Layout**:
  - Collapsible desktop sidebar (250px fixed or icon-rail with tooltips).
  - Mobile Sheet drawer.
  - Global Command Palette (`Cmd+K` / `Ctrl+K`) searching pages, customers, and products.
  - Granular breadcrumbs, notifications popover, and profile dropdown.
  - Segments with `loading.js`, `error.js`, and `not-found.js`.

---

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS with custom theme variables
- **Component Primitives**: Radix UI (Dialog, Sheet, Dropdown, Tabs, Tooltip, Select, Checkbox, Avatar, Separator)
- **Icons**: Lucide React + custom inline SVG icons (Instagram, WhatsApp)
- **Data Visualization**: Recharts (Line charts, Bar charts, Donut charts)
- **State Management**:
  - Server Cache: TanStack React Query (`@tanstack/react-query`) with automatic invalidation and refetching
  - Client UI State: Zustand (`ui-store`, `inbox-store`, `preference-store`)
- **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Notifications**: Sonner (Toasts)
- **Date Utilities**: `date-fns`

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The root `/` automatically redirects to `/dashboard`.

### 3. Production Build & Test
```bash
npm run build
npm run start
```

---

## 🧭 Routes & Modules Overview

| Route | Module | Key Capabilities |
| :--- | :--- | :--- |
| `/dashboard` | **Overview Dashboard** | 6 KPI stat cards, engagement line chart with date filter, automation performance, recent customer activity, top reels, top products, recent orders. |
| `/orders` | **Orders Management** | 6 order status summary cards, customizable `DataTable` with status filter, date range, search, pagination, CSV export, and slide-over order details drawer with live status update. |
| `/products` | **Product Catalog** | Grid / Table views, category and stock filters, Add Product modal with Zod validation, Edit modal, delete confirmation dialog, and product details drawer. |
| `/categories` | **Categories** | Derived product counts, category creation & editing, display order management, and active status toggling. |
| `/reels` | **Reels & Posts** | Connected Instagram account banner, Grid & Table view, automation assignment badge, and detail drawer with live **Assign Automation** selector that updates global state. |
| `/automations` | **Automation Engine** | KPI cards, status toggle (Active/Inactive), duplicate workflow, delete, filter by trigger type and status. |
| `/automations/create` | **Visual Workflow Builder** | 6-step interactive visual automation flow: Trigger → Identify Contact → Find Product → Send DM → Track Click → Update Activity. Live side config panel and realistic Instagram DM smartphone preview with variable placeholders. |
| `/automations/[id]` | **Workflow Editor** | Full visual builder preloaded with existing automation flow configurations for quick tweaking. |
| `/customers` | **Customer CRM** | CRM metrics, search by username/name/ID, tag filters, quick-view drawer, and link to comprehensive customer profile. |
| `/customers/[id]` | **Full Customer Profile** | 11 core sections: Bio & IG profile, tag management, products interacted, DM chat transcript, reels engaged, link click history, orders, automation execution logs, and interactive 6-step customer journey timeline. |
| `/inbox` | **Conversations & DM Logs** | **Tab 1: 3-Column Inbox** with live search, filters (All, Unread, Assigned, Resolved), real-time message bubble stream, manual message sending with local state append, and contact metadata side panel. Switches to mobile view on small screens. <br>**Tab 2: DM Activity** log tracking delivery status (Sent, Delivered, Failed) and link click status. |
| `/tags` | **Tags & Segments** | Live segment count cards, Segment Filter Builder modal (field, operator, value), and Tags management table with derived customer counts. |
| `/analytics` | **Deep Analytics** | Date filter (Today, 7D, 30D, 90D, Custom), 7 core metrics, Recharts trends (Contact growth, Messages over time, Link click trends, Automation comparison, Product performance bar chart, Reels conversion, Traffic source pie). |
| `/reports` | **Reporting Center** | 6 report types, date range selector, in-page live preview table, CSV export, and simulated PDF download toast. |
| `/integrations` | **Integrations** | Connect/disconnect state toggle for Meta Instagram Graph API, Shopify/WooCommerce, Webhooks, and External CRM. |
| `/settings` | **System Settings** | 5 configuration tabs: General, Instagram, Notifications, Team (with member invite & remove), and Preferences (table density switcher, theme, language). |

---

## 📂 Project Directory Structure

```text
src/
├── app/
│   ├── (admin)/
│   │   ├── analytics/page.js
│   │   ├── automations/
│   │   │   ├── [id]/page.js
│   │   │   ├── create/page.js
│   │   │   └── page.js
│   │   ├── categories/page.js
│   │   ├── customers/
│   │   │   ├── [id]/page.js
│   │   │   └── page.js
│   │   ├── dashboard/page.js
│   │   ├── inbox/page.js
│   │   ├── integrations/page.js
│   │   ├── orders/page.js
│   │   ├── products/page.js
│   │   ├── reels/page.js
│   │   ├── reports/page.js
│   │   ├── settings/page.js
│   │   ├── tags/page.js
│   │   ├── error.js
│   │   ├── layout.js
│   │   └── loading.js
│   ├── globals.css
│   ├── layout.js
│   ├── not-found.js
│   ├── page.js
│   └── providers.js
├── components/
│   ├── automations/
│   │   ├── message-preview.jsx
│   │   ├── node-config-panel.jsx
│   │   ├── workflow-builder.jsx
│   │   └── workflow-node.jsx
│   ├── dashboard/
│   │   ├── activity-chart.jsx
│   │   ├── recent-activity.jsx
│   │   ├── stat-card.jsx
│   │   └── top-products.jsx
│   ├── layout/
│   │   ├── app-breadcrumb.jsx
│   │   ├── app-header.jsx
│   │   ├── app-sidebar.jsx
│   │   ├── global-search-dialog.jsx
│   │   └── mobile-sidebar.jsx
│   ├── products/
│   │   └── product-form-dialog.jsx
│   ├── shared/
│   │   ├── confirm-dialog.jsx
│   │   ├── data-table.jsx
│   │   ├── empty-state.jsx
│   │   ├── filter-dropdown.jsx
│   │   ├── icons.jsx
│   │   ├── loading-state.jsx
│   │   ├── page-header.jsx
│   │   ├── search-input.jsx
│   │   └── status-badge.jsx
│   └── ui/
│       ├── avatar.jsx, badge.jsx, button.jsx, card.jsx, checkbox.jsx,
│       ├── command.jsx, dialog.jsx, dropdown-menu.jsx, input.jsx,
│       ├── select.jsx, separator.jsx, sheet.jsx, skeleton.jsx,
│       ├── tabs.jsx, textarea.jsx, tooltip.jsx
├── config/
│   ├── navigation.js
│   └── site-config.js
├── data/
│   ├── automations.data.js
│   ├── categories.data.js
│   ├── customers.data.js
│   ├── db.js
│   ├── dm-activity.data.js
│   ├── integrations.data.js
│   ├── messages.data.js
│   ├── orders.data.js
│   ├── products.data.js
│   ├── reels.data.js
│   ├── segments.data.js
│   ├── settings.data.js
│   └── tags.data.js
├── hooks/
│   ├── use-analytics.js
│   ├── use-automations.js
│   ├── use-customers.js
│   ├── use-dashboard.js
│   ├── use-messages.js
│   ├── use-orders.js
│   ├── use-products.js
│   └── use-reels.js
├── lib/
│   ├── axios.js
│   ├── constants.js
│   ├── query-client.js
│   └── utils.js
├── services/
│   ├── analytics.service.js
│   ├── automations.service.js
│   ├── categories.service.js
│   ├── customers.service.js
│   ├── dashboard.service.js
│   ├── integrations.service.js
│   ├── messages.service.js
│   ├── orders.service.js
│   ├── products.service.js
│   ├── reels.service.js
│   ├── reports.service.js
│   ├── settings.service.js
│   └── tags.service.js
├── store/
│   ├── inbox-store.js
│   ├── preference-store.js
│   └── ui-store.js
└── styles/
    └── theme.js
```
