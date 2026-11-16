import { create } from "zustand";

export const useInboxStore = create((set) => ({
  selectedConversationId: null,
  activeFilter: "all", // "all" | "unread" | "assigned" | "resolved"
  searchQuery: "",
  mobileView: "list", // "list" | "detail"

  setSelectedConversationId: (id) => set({ selectedConversationId: id, mobileView: "detail" }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMobileView: (view) => set({ mobileView: view }),
  resetSelection: () => set({ selectedConversationId: null, mobileView: "list" }),
}));
