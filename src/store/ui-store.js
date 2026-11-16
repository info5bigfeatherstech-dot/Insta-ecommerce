import { create } from "zustand";

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  globalSearchOpen: false,
  activeFilterDrawer: null,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
  setActiveFilterDrawer: (drawer) => set({ activeFilterDrawer: drawer }),
}));
