import { db, delay } from "@/data/db";

export const dashboardService = {
  async getDashboardData(timeRange = "30d") {
    await delay(350);
    const agg = db.getDashboardAggregates();

    // 6 Stat cards with previous-period comparisons & trends
    const stats = [
      {
        id: "total_contacts",
        title: "Total Instagram Contacts",
        value: agg.totalContacts,
        change: "+18.4%",
        trend: "up",
        comparison: "vs last 30 days",
        icon: "Users",
      },
      {
        id: "new_contacts",
        title: "New Contacts",
        value: agg.newContacts,
        change: "+24.2%",
        trend: "up",
        comparison: "vs previous month",
        icon: "UserPlus",
      },
      {
        id: "messages_sent",
        title: "Messages Sent",
        value: agg.messagesSent,
        change: "+31.6%",
        trend: "up",
        comparison: "vs last month",
        icon: "Send",
      },
      {
        id: "link_clicks",
        title: "Total Link Clicks",
        value: agg.linkClicks,
        change: "+15.8%",
        trend: "up",
        comparison: "68.2% CTR average",
        icon: "MousePointerClick",
      },
      {
        id: "active_automations",
        title: "Active Automations",
        value: agg.activeAutomations,
        change: "+2 new",
        trend: "up",
        comparison: `${db.state.automations.length} total created`,
        icon: "Zap",
      },
      {
        id: "total_orders",
        title: "Attributed Orders",
        value: agg.totalOrders,
        change: "+28.1%",
        trend: "up",
        comparison: `₹${(agg.totalRevenue / 1000).toFixed(1)}k revenue`,
        icon: "ShoppingCart",
      },
    ];

    // Engagement Overview Chart Data (last 14 days)
    const engagementChart = [
      { date: "Feb 16", contacts: 14, messages: 110, clicks: 78, orders: 8 },
      { date: "Feb 17", contacts: 19, messages: 135, clicks: 94, orders: 12 },
      { date: "Feb 18", contacts: 22, messages: 160, clicks: 115, orders: 14 },
      { date: "Feb 19", contacts: 25, messages: 185, clicks: 130, orders: 16 },
      { date: "Feb 20", contacts: 30, messages: 210, clicks: 148, orders: 18 },
      { date: "Feb 21", contacts: 38, messages: 270, clicks: 190, orders: 22 },
      { date: "Feb 22", contacts: 42, messages: 320, clicks: 235, orders: 28 },
      { date: "Feb 23", contacts: 36, messages: 290, clicks: 210, orders: 24 },
      { date: "Feb 24", contacts: 45, messages: 345, clicks: 255, orders: 31 },
      { date: "Feb 25", contacts: 52, messages: 390, clicks: 290, orders: 35 },
      { date: "Feb 26", contacts: 48, messages: 370, clicks: 275, orders: 33 },
      { date: "Feb 27", contacts: 56, messages: 420, clicks: 310, orders: 38 },
      { date: "Feb 28", contacts: 64, messages: 480, clicks: 360, orders: 44 },
      { date: "Mar 01", contacts: 71, messages: 530, clicks: 395, orders: 49 },
    ];

    // Automation Performance (Top 5)
    const automationPerformance = db.state.automations
      .slice(0, 5)
      .map((a) => {
        const successRate = a.executions > 0 
          ? (((a.executions - a.failedCount) / a.executions) * 100).toFixed(1) 
          : "100.0";
        return {
          id: a.id,
          name: a.name,
          triggers: a.executions,
          delivered: a.messagesSent,
          clicks: a.linkClicks,
          conversions: a.conversions,
          successRate: `${successRate}%`,
          status: a.status,
        };
      });

    // Recent Customer Activity
    const recentActivity = [
      {
        id: "act_1",
        customer: db.state.customers[0],
        activity: "Placed repeat order for Chunky Silver Hoops",
        product: db.state.products[15],
        timestamp: "2026-03-01T11:20:00Z",
        type: "purchase",
      },
      {
        id: "act_2",
        customer: db.state.customers[1],
        activity: "Triggered 'BUDS' automation via Story Reply",
        product: db.state.products[10],
        timestamp: "2026-03-01T11:30:00Z",
        type: "dm_trigger",
      },
      {
        id: "act_3",
        customer: db.state.customers[31],
        activity: "Clicked checkout link for Gold Vermeil Necklace",
        product: db.state.products[1],
        timestamp: "2026-03-01T10:10:00Z",
        type: "link_click",
      },
      {
        id: "act_4",
        customer: db.state.customers[2],
        activity: "Inquired about delivery timeline in DM",
        product: db.state.products[2],
        timestamp: "2026-03-01T09:40:00Z",
        type: "inbox_message",
      },
      {
        id: "act_5",
        customer: db.state.customers[4],
        activity: "Commented 'HOTEL' on Bedsheet Reel",
        product: db.state.products[3],
        timestamp: "2026-03-01T08:50:00Z",
        type: "reel_comment",
      },
    ];

    // Top Performing Reels
    const topReels = db.state.reels
      .filter((r) => r.triggerCount > 0)
      .sort((a, b) => b.linkClicks - a.linkClicks)
      .slice(0, 5)
      .map((r) => {
        const prod = db.state.products.find((p) => p.id === r.productId);
        const auto = db.state.automations.find((a) => a.id === r.automationId);
        return {
          id: r.id,
          caption: r.caption,
          instagramPostId: r.instagramPostId,
          productName: prod ? prod.name : "Featured Product",
          automationName: auto ? auto.name : "Unassigned",
          triggerCount: r.triggerCount,
          clicks: r.linkClicks,
          conversions: r.conversions,
        };
      });

    // Top Products
    const topProducts = db.state.products
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        messagesSent: p.messagesSent,
        linkClicks: p.linkClicks,
        orders: p.ordersCount,
        category: db.state.categories.find((c) => c.id === p.categoryId)?.name || "Store",
      }));

    // Recent Orders
    const recentOrders = db.state.orders.slice(0, 6);

    return {
      success: true,
      data: {
        stats,
        engagementChart,
        automationPerformance,
        recentActivity,
        topReels,
        topProducts,
        recentOrders,
      },
      message: "Dashboard data retrieved successfully",
    };
  },
};
