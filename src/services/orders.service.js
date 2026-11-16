import { db, delay } from "@/data/db";

export const ordersService = {
  async getOrders(params = {}) {
    await delay(350);
    const {
      search = "",
      status = "all",
      paymentMethod = "all",
      paymentStatus = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = params;

    let orders = [...db.state.orders];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.instagramUsername.toLowerCase().includes(q) ||
          o.items.some((item) => item.productName.toLowerCase().includes(q))
      );
    }

    // Filter by fulfillment status
    if (status && status !== "all") {
      orders = orders.filter((o) => o.fulfillmentStatus === status);
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== "all") {
      orders = orders.filter((o) => o.paymentMethod.toLowerCase().includes(paymentMethod.toLowerCase()));
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== "all") {
      orders = orders.filter((o) => o.paymentStatus === paymentStatus);
    }

    // Sort
    orders.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "totalAmount") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    // Stats
    const all = db.state.orders;
    const stats = {
      total: all.length,
      pending: all.filter((o) => o.fulfillmentStatus === "pending").length,
      processing: all.filter((o) => o.fulfillmentStatus === "processing").length,
      shipped: all.filter((o) => o.fulfillmentStatus === "shipped").length,
      delivered: all.filter((o) => o.fulfillmentStatus === "delivered").length,
      cancelled: all.filter((o) => o.fulfillmentStatus === "cancelled").length,
    };

    // Pagination
    const totalRecords = orders.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = orders.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        orders: paginated,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalRecords,
          totalPages,
        },
      },
      message: "Orders retrieved successfully",
    };
  },

  async getOrderById(id) {
    await delay(250);
    const order = db.state.orders.find((o) => o.id === id);
    if (!order) {
      return { success: false, data: null, message: "Order not found" };
    }
    return { success: true, data: order, message: "Order found" };
  },

  async updateOrderStatus(id, newStatus, trackingNotes = "") {
    await delay(400);
    const orderIndex = db.state.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return { success: false, data: null, message: "Order not found" };
    }

    const order = db.state.orders[orderIndex];
    order.fulfillmentStatus = newStatus;

    // Append to order timeline
    const timelineEntry = {
      title: `Status Updated to ${newStatus.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      description: trackingNotes || `Fulfillment status changed to ${newStatus}`,
      done: true,
    };
    order.timeline = [timelineEntry, ...(order.timeline || [])];

    db.state.orders[orderIndex] = { ...order };
    db.persist();

    return {
      success: true,
      data: order,
      message: `Order status updated to ${newStatus}`,
    };
  },
};
