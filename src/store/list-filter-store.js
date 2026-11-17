import { create } from "zustand";

export const useListFilterStore = create((set) => ({
  // Orders List State
  orders: {
    search: "",
    status: "all",
    paymentMethod: "all",
    paymentStatus: "all",
    page: 1,
  },
  setOrdersFilter: (filter) =>
    set((state) => ({ orders: { ...state.orders, ...filter } })),

  // Products List State
  products: {
    search: "",
    category: "all",
    status: "all",
    page: 1,
    viewMode: "grid", // "grid" | "table"
  },
  setProductsFilter: (filter) =>
    set((state) => ({ products: { ...state.products, ...filter } })),

  // Reels List State
  reels: {
    search: "",
    filter: "all",
    viewMode: "grid", // "grid" | "table"
  },
  setReelsFilter: (filter) =>
    set((state) => ({ reels: { ...state.reels, ...filter } })),

  // Customers List State
  customers: {
    search: "",
    status: "all",
    tag: "all",
    page: 1,
  },
  setCustomersFilter: (filter) =>
    set((state) => ({ customers: { ...state.customers, ...filter } })),

  // Automations List State
  automations: {
    search: "",
    status: "all",
    triggerType: "all",
  },
  setAutomationsFilter: (filter) =>
    set((state) => ({ automations: { ...state.automations, ...filter } })),
}));
