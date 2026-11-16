import { db, delay } from "@/data/db";

export const customersService = {
  async getCustomers(params = {}) {
    await delay(350);
    const {
      search = "",
      status = "all",
      tag = "all",
      source = "all",
      sortBy = "lastInteraction",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = params;

    let customers = db.state.customers.map((c) => {
      const sourceReel = db.state.reels.find((r) => r.id === c.sourceReelId);
      const tagObjects = (c.tags || [])
        .map((tId) => db.state.tags.find((t) => t.id === tId))
        .filter(Boolean);
      const products = (c.interestedProductIds || [])
        .map((pId) => db.state.products.find((p) => p.id === pId))
        .filter(Boolean);

      return {
        ...c,
        sourceReel,
        tagObjects,
        products,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.instagramUserId.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    if (status && status !== "all") {
      customers = customers.filter((c) => c.status === status);
    }

    if (tag && tag !== "all") {
      customers = customers.filter((c) => c.tags && c.tags.includes(tag));
    }

    if (source && source !== "all") {
      customers = customers.filter((c) => c.sourceReelId === source);
    }

    customers.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "totalMessages" || sortBy === "lifetimeSpend" || sortBy === "ordersCount") {
        return sortOrder === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      }
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const all = db.state.customers;
    const stats = {
      total: all.length,
      new: all.filter((c) => c.status === "new").length,
      active: all.filter((c) => c.status === "active").length,
      returning: all.filter((c) => c.status === "returning").length,
    };

    const totalRecords = customers.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = customers.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        customers: paginated,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalRecords,
          totalPages,
        },
      },
      message: "Customers retrieved successfully",
    };
  },

  async getCustomerById(id) {
    await delay(300);
    const customer = db.state.customers.find((c) => c.id === id);
    if (!customer) return { success: false, data: null, message: "Customer not found" };

    const sourceReel = db.state.reels.find((r) => r.id === customer.sourceReelId);
    const tagObjects = (customer.tags || [])
      .map((tId) => db.state.tags.find((t) => t.id === tId))
      .filter(Boolean);
    const products = (customer.interestedProductIds || [])
      .map((pId) => db.state.products.find((p) => p.id === pId))
      .filter(Boolean);

    // Customer orders
    const orders = db.state.orders.filter((o) => o.customerId === id);

    // Customer DM Activity
    const dmActivity = db.state.dmActivity.filter((dma) => dma.customerId === id);

    // Customer Conversation History
    const conversation = db.state.conversations.find((conv) => conv.customerId === id);

    // Customer Journey Timeline
    const journey = [
      {
        step: 1,
        title: "Discovered Reel",
        status: "completed",
        timestamp: customer.firstInteraction,
        details: sourceReel ? `Watched Reel "${sourceReel.caption.slice(0, 40)}..."` : "Discovered via Instagram explore",
        icon: "Film",
      },
      {
        step: 2,
        title: "Triggered Automation",
        status: "completed",
        timestamp: customer.firstInteraction,
        details: `Sent keyword trigger in comments`,
        icon: "Zap",
      },
      {
        step: 3,
        title: "Received Instagram DM",
        status: "completed",
        timestamp: customer.firstInteraction,
        details: "Automated direct message delivered with personalized product link",
        icon: "Send",
      },
      {
        step: 4,
        title: "Clicked Product Link",
        status: customer.linksClicked > 0 ? "completed" : "pending",
        timestamp: customer.linksClicked > 0 ? dmActivity[0]?.clickedTime || customer.lastInteraction : null,
        details: customer.linksClicked > 0 ? "User clicked trackable store link" : "Awaiting user tap on DM button",
        icon: "MousePointerClick",
      },
      {
        step: 5,
        title: "Visited Store",
        status: customer.linksClicked > 0 ? "completed" : "pending",
        timestamp: customer.linksClicked > 0 ? customer.lastInteraction : null,
        details: "Viewed product page on mobile web store",
        icon: "ExternalLink",
      },
      {
        step: 6,
        title: "Purchased",
        status: customer.ordersCount > 0 ? "completed" : "pending",
        timestamp: orders[0]?.createdAt || null,
        details: customer.ordersCount > 0 ? `Completed ${customer.ordersCount} order(s) worth ₹${customer.lifetimeSpend.toLocaleString("en-IN")}` : "No completed order yet",
        icon: "ShoppingBag",
      },
    ];

    return {
      success: true,
      data: {
        ...customer,
        sourceReel,
        tagObjects,
        products,
        orders,
        dmActivity,
        conversation,
        journey,
      },
      message: "Customer profile retrieved",
    };
  },

  async addTagToCustomer(customerId, tagId) {
    await delay(300);
    const customer = db.state.customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, data: null, message: "Customer not found" };

    if (!customer.tags) customer.tags = [];
    if (!customer.tags.includes(tagId)) {
      customer.tags.push(tagId);
      db.persist();
    }

    return {
      success: true,
      data: customer,
      message: "Tag added successfully",
    };
  },

  async removeTagFromCustomer(customerId, tagId) {
    await delay(300);
    const customer = db.state.customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, data: null, message: "Customer not found" };

    if (customer.tags) {
      customer.tags = customer.tags.filter((t) => t !== tagId);
      db.persist();
    }

    return {
      success: true,
      data: customer,
      message: "Tag removed successfully",
    };
  },
};
