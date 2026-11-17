import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Film,
  Zap,
  Users,
  MessageSquare,
  Tags,
  BarChart3,
  FileSpreadsheet,
  Settings,
} from "lucide-react";

export const NAVIGATION_GROUPS = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null,
      },
    ],
  },
  {
    title: "Ecommerce",
    items: [
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        badge: "ordersCount",
      },
      {
        title: "Products",
        href: "/products",
        icon: Package,
        badge: null,
      },
      {
        title: "Categories",
        href: "/categories",
        icon: FolderTree,
        badge: null,
      },
    ],
  },
  {
    title: "Instagram Automation",
    items: [
      {
        title: "Reels & Posts",
        href: "/reels",
        icon: Film,
        badge: null,
      },
      {
        title: "Automations",
        href: "/automations",
        icon: Zap,
        badge: "activeAutomationsCount",
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
        badge: null,
      },
      {
        title: "Inbox & DM Activity",
        href: "/inbox",
        icon: MessageSquare,
        badge: "unreadCount",
      },
      {
        title: "Tags & Segments",
        href: "/tags",
        icon: Tags,
        badge: null,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        badge: null,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: FileSpreadsheet,
        badge: null,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        badge: null,
      },
    ],
  },
];
