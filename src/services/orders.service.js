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

  async updateOrderCustomerDetails(orderId, customerData) {
    await delay(350);
    const orderIndex = db.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return { success: false, data: null, message: "Order not found" };
    }

    const order = db.state.orders[orderIndex];

    const formattedUsername = customerData.instagramUsername
      ? customerData.instagramUsername.startsWith("@")
        ? customerData.instagramUsername
        : `@${customerData.instagramUsername}`
      : order.instagramUsername;

    if (customerData.customerName) order.customerName = customerData.customerName;
    if (formattedUsername) order.instagramUsername = formattedUsername;
    if (customerData.customerEmail !== undefined) order.customerEmail = customerData.customerEmail;
    if (customerData.customerPhone !== undefined) order.customerPhone = customerData.customerPhone;

    const updatedAddress = {
      ...(order.shippingAddress || {}),
      name: customerData.customerName || order.customerName,
      street: customerData.street !== undefined ? customerData.street : order.shippingAddress?.street,
      city: customerData.city !== undefined ? customerData.city : order.shippingAddress?.city,
      state: customerData.state !== undefined ? customerData.state : order.shippingAddress?.state,
      postalCode: customerData.postalCode !== undefined ? customerData.postalCode : order.shippingAddress?.postalCode,
      country: customerData.country !== undefined ? customerData.country : (order.shippingAddress?.country || "India"),
      phone: customerData.customerPhone !== undefined ? customerData.customerPhone : order.shippingAddress?.phone,
    };

    order.shippingAddress = updatedAddress;

    // Append to order timeline
    const timelineEntry = {
      title: "Customer & Address Updated",
      timestamp: new Date().toISOString(),
      description: `Customer details and shipping destination updated by store admin`,
      done: true,
    };
    order.timeline = [timelineEntry, ...(order.timeline || [])];

    // Sync back to central customer dossier in db.state.customers
    if (order.customerId) {
      const custIndex = db.state.customers.findIndex((c) => c.id === order.customerId);
      if (custIndex !== -1) {
        const cust = db.state.customers[custIndex];
        if (customerData.customerName) cust.name = customerData.customerName;
        if (formattedUsername) cust.username = formattedUsername;
        if (customerData.customerEmail !== undefined) cust.email = customerData.customerEmail;
        if (customerData.customerPhone !== undefined) cust.phone = customerData.customerPhone;
        if (customerData.city) cust.city = customerData.city;
        cust.address = {
          ...(cust.address || {}),
          ...updatedAddress,
        };
        db.state.customers[custIndex] = { ...cust };
      }
    }

    db.state.orders[orderIndex] = { ...order };
    db.persist();

    return {
      success: true,
      data: order,
      message: "Customer profile and delivery address updated successfully",
    };
  },

  async updateOrderItems(orderId, updatedItems) {
    await delay(350);
    const orderIndex = db.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return { success: false, data: null, message: "Order not found" };
    }

    const order = db.state.orders[orderIndex];

    // Filter out items with 0 or negative quantity
    const validItems = updatedItems
      .filter((item) => Number(item.quantity) > 0)
      .map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        total: Number(item.price) * Number(item.quantity),
      }));

    if (validItems.length === 0) {
      return { success: false, data: null, message: "Order must contain at least one item" };
    }

    const newSubtotal = validItems.reduce((sum, item) => sum + item.total, 0);
    const discount = order.discount || 0;
    const shipping = order.shipping || 0;
    const newTotalAmount = Math.max(0, newSubtotal - discount + shipping);

    order.items = validItems;
    order.subtotal = newSubtotal;
    order.totalAmount = newTotalAmount;

    // Append to timeline
    const timelineEntry = {
      title: "Order Items & Quantities Updated",
      timestamp: new Date().toISOString(),
      description: `Adjusted to ${validItems.length} item(s). New subtotal: ₹${newSubtotal.toLocaleString(
        "en-IN"
      )}, Total: ₹${newTotalAmount.toLocaleString("en-IN")}`,
      done: true,
    };
    order.timeline = [timelineEntry, ...(order.timeline || [])];

    db.state.orders[orderIndex] = { ...order };
    db.persist();

    return {
      success: true,
      data: order,
      message: "Order items and totals updated successfully",
    };
  },
};
