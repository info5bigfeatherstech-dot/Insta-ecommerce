import { create } from "zustand";

const PREF_STORAGE_KEY = "instacommerce_preferences";

const defaultPreferences = {
  theme: "light",
  tableDensity: "normal", // 'compact' | 'normal' | 'comfortable'
  language: "en",
  currency: "INR",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  notifications: {
    failedAutomations: true,
    newCustomers: true,
    orders: true,
    weeklyReport: false,
  },
};

function loadStoredPreferences() {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

export const usePreferenceStore = create((set, get) => ({
  ...defaultPreferences,

  initFromStorage: () => {
    const loaded = loadStoredPreferences();
    set(loaded);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-density", loaded.tableDensity);
    }
  },

  setTableDensity: (density) => {
    set({ tableDensity: density });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-density", density);
    }
    const current = get();
    try {
      localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(current));
    } catch {}
  },

  updatePreferences: (newPrefs) => {
    set((state) => {
      const updated = { ...state, ...newPrefs };
      if (typeof document !== "undefined" && newPrefs.tableDensity) {
        document.documentElement.setAttribute("data-density", newPrefs.tableDensity);
      }
      try {
        localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  },
}));
