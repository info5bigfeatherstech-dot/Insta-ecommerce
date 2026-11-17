import { initialCategories } from "./categories.data";
import { initialProducts } from "./products.data";
import { initialTags } from "./tags.data";
import { initialSegments } from "./segments.data";
import { initialCustomers } from "./customers.data";
import { initialReels } from "./reels.data";
import { initialAutomations } from "./automations.data";
import { initialOrders } from "./orders.data";
import { initialConversations } from "./messages.data";
import { initialDmActivity } from "./dm-activity.data";
import { initialSettings } from "./settings.data";

const DB_STORAGE_KEY = "instacommerce_mock_database_v3";

// Helper to simulate network latency
export const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

class MockDatabase {
  constructor() {
    this.state = this.loadInitialData();
  }

  loadInitialData() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(DB_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.products && parsed.customers) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Could not load from localStorage, falling back to seed data", e);
      }
    }

    return {
      categories: [...initialCategories],
      products: [...initialProducts],
      tags: [...initialTags],
      segments: [...initialSegments],
      customers: [...initialCustomers],
      reels: [...initialReels],
      automations: [...initialAutomations],
      orders: [...initialOrders],
      conversations: [...initialConversations],
      dmActivity: [...initialDmActivity],
      settings: { ...initialSettings },
    };
  }

  persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn("Failed to persist database state to localStorage", e);
      }
    }
  }

  resetToDefault() {
    this.state = {
      categories: [...initialCategories],
      products: [...initialProducts],
      tags: [...initialTags],
      segments: [...initialSegments],
      customers: [...initialCustomers],
      reels: [...initialReels],
      automations: [...initialAutomations],
      orders: [...initialOrders],
      conversations: [...initialConversations],
      dmActivity: [...initialDmActivity],
      settings: { ...initialSettings },
    };
    this.persist();
    return this.state;
  }

  // Derived: Categories with product counts
  getCategoriesWithStats() {
    return this.state.categories.map((cat) => {
      const count = this.state.products.filter((p) => p.categoryId === cat.id).length;
      return {
        ...cat,
        productCount: count,
      };
    });
  }

  // Derived: Tags with contact counts
  getTagsWithStats() {
    return this.state.tags.map((tag) => {
      const contactCount = this.state.customers.filter((c) => c.tags && c.tags.includes(tag.id)).length;
      return {
        ...tag,
        contactCount,
      };
    });
  }

  // Derived: Segments with dynamically evaluated live counts
  getSegmentsWithStats() {
    return this.state.segments.map((seg) => {
      const matchingCount = this.state.customers.filter((customer) => {
        return seg.conditions.every((cond) => {
          const val = customer[cond.field];
          if (cond.operator === "equals") return val === cond.value;
          if (cond.operator === "not_equals") return val !== cond.value;
          if (cond.operator === "greater_than") return Number(val || 0) > Number(cond.value);
          if (cond.operator === "contains") {
            if (Array.isArray(val)) return val.includes(cond.value);
            return String(val || "").toLowerCase().includes(String(cond.value).toLowerCase());
          }
          return true;
        });
      }).length;

      return {
        ...seg,
        count: matchingCount,
      };
    });
  }

  // Derived: Dashboard aggregates
  getDashboardAggregates() {
    const totalContacts = this.state.customers.length;
    const newContacts = this.state.customers.filter((c) => c.status === "new").length;
    
    const messagesSent = this.state.automations.reduce((acc, a) => acc + (a.messagesSent || 0), 0) +
      this.state.conversations.reduce((acc, c) => acc + c.messages.filter((m) => m.sender !== "user").length, 0);

    const linkClicks = this.state.automations.reduce((acc, a) => acc + (a.linkClicks || 0), 0);
    const activeAutomations = this.state.automations.filter((a) => a.status === "active").length;
    const totalOrders = this.state.orders.length;
    const totalRevenue = this.state.orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return {
      totalContacts,
      newContacts,
      messagesSent,
      linkClicks,
      activeAutomations,
      totalOrders,
      totalRevenue,
    };
  }
}

export const db = new MockDatabase();
export default db;
