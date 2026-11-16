import { db, delay } from "@/data/db";

export const messagesService = {
  async getConversations(params = {}) {
    await delay(300);
    const { search = "", filter = "all" } = params;

    let conversations = db.state.conversations.map((conv) => {
      const customer = db.state.customers.find((c) => c.id === conv.customerId);
      return {
        ...conv,
        customer,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      conversations = conversations.filter(
        (c) =>
          c.username.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }

    if (filter === "unread") {
      conversations = conversations.filter((c) => c.unread);
    } else if (filter === "assigned") {
      conversations = conversations.filter((c) => Boolean(c.assignedTo));
    } else if (filter === "resolved") {
      conversations = conversations.filter((c) => c.status === "resolved");
    }

    return {
      success: true,
      data: conversations,
      message: "Conversations retrieved",
    };
  },

  async getConversationById(id) {
    await delay(200);
    const conv = db.state.conversations.find((c) => c.id === id);
    if (!conv) return { success: false, data: null, message: "Conversation not found" };

    const customer = db.state.customers.find((c) => c.id === conv.customerId);
    const tags = (customer?.tags || [])
      .map((tId) => db.state.tags.find((t) => t.id === tId))
      .filter(Boolean);
    const products = (customer?.interestedProductIds || [])
      .map((pId) => db.state.products.find((p) => p.id === pId))
      .filter(Boolean);
    const recentAutomation = db.state.dmActivity
      .filter((d) => d.customerId === conv.customerId)
      .slice(0, 5);

    return {
      success: true,
      data: {
        ...conv,
        customer,
        tags,
        products,
        recentAutomation,
      },
      message: "Conversation found",
    };
  },

  async sendMessage(conversationId, text) {
    await delay(350);
    const conv = db.state.conversations.find((c) => c.id === conversationId);
    if (!conv) return { success: false, data: null, message: "Conversation not found" };

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: "agent",
      text,
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    conv.messages.push(newMsg);
    conv.lastMessage = text;
    conv.lastMessageTimestamp = newMsg.timestamp;
    conv.unread = false;

    db.persist();

    return {
      success: true,
      data: newMsg,
      message: "Message sent",
    };
  },

  async updateConversationStatus(conversationId, newStatus) {
    await delay(250);
    const conv = db.state.conversations.find((c) => c.id === conversationId);
    if (!conv) return { success: false, data: null, message: "Conversation not found" };

    conv.status = newStatus;
    db.persist();

    return {
      success: true,
      data: conv,
      message: `Conversation marked as ${newStatus}`,
    };
  },

  async assignConversation(conversationId, assigneeName) {
    await delay(250);
    const conv = db.state.conversations.find((c) => c.id === conversationId);
    if (!conv) return { success: false, data: null, message: "Conversation not found" };

    conv.assignedTo = assigneeName;
    db.persist();

    return {
      success: true,
      data: conv,
      message: `Conversation assigned to ${assigneeName}`,
    };
  },

  // DM Activity Table
  async getDmActivity(params = {}) {
    await delay(350);
    const { search = "", status = "all", page = 1, limit = 10 } = params;

    let activities = [...db.state.dmActivity];

    if (search) {
      const q = search.toLowerCase();
      activities = activities.filter(
        (a) =>
          a.customerName.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q) ||
          a.automationName.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q)
      );
    }

    if (status && status !== "all") {
      activities = activities.filter((a) => a.deliveryStatus === status);
    }

    const totalRecords = activities.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = activities.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        activities: paginated,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalRecords,
          totalPages,
        },
      },
      message: "DM Activity retrieved",
    };
  },
};
