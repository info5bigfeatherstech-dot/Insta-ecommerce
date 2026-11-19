import { db, delay } from "@/data/db";

export const analyticsService = {
  async getAnalytics(dateRange = "30d") {
    return this.getAnalyticsData(dateRange);
  },

  async getAnalyticsData(dateRange = "30d") {
    await delay(350);
    const agg = db.getDashboardAggregates();

    // 7 Core Stats
    const stats = {
      totalContacts: agg.totalContacts,
      automationTriggers: db.state.automations.reduce((sum, a) => sum + (a.executions || 0), 0),
      messagesSent: agg.messagesSent,
      messagesDelivered: Math.floor(agg.messagesSent * 0.98),
      linkClicks: agg.linkClicks,
      orders: agg.totalOrders,
      attributedRevenue: agg.totalRevenue,
    };

    // 1. Contact Growth Over Time (Daily)
    const contactGrowthChart = [
      { date: "Day 1", contacts: 4, cumulative: 4 },
      { date: "Day 5", contacts: 7, cumulative: 11 },
      { date: "Day 10", contacts: 9, cumulative: 20 },
      { date: "Day 15", contacts: 12, cumulative: 32 },
      { date: "Day 20", contacts: 16, cumulative: 48 },
      { date: "Day 25", contacts: 21, cumulative: 69 },
      { date: "Day 30", contacts: 28, cumulative: 97 },
    ];

    // 2. Messages & Deliveries Over Time
    const messagesOverTimeChart = [
      { date: "Week 1", sent: 480, delivered: 472, failed: 8 },
      { date: "Week 2", sent: 690, delivered: 678, failed: 12 },
      { date: "Week 3", sent: 920, delivered: 902, failed: 18 },
      { date: "Week 4", sent: 1250, delivered: 1228, failed: 22 },
    ];

    // 3. Link Click Trends & CTR
    const linkClickTrends = [
      { date: "Week 1", sent: 480, clicks: 310, ctr: 64.5 },
      { date: "Week 2", sent: 690, clicks: 485, ctr: 70.2 },
      { date: "Week 3", sent: 920, clicks: 650, ctr: 70.6 },
      { date: "Week 4", sent: 1250, clicks: 890, ctr: 71.2 },
    ];

    // 4. Automation Comparison (Executions vs Clicks)
    const automationComparison = db.state.automations.slice(0, 6).map((a) => ({
      name: a.name.split("-")[0].trim().slice(0, 16),
      triggers: a.executions,
      clicks: a.linkClicks,
      conversions: a.conversions,
    }));

    // 5. Product Performance Bar Chart (Messages vs Orders)
    const productPerformanceChart = db.state.products.slice(0, 6).map((p) => ({
      name: p.name.slice(0, 15) + "...",
      messages: p.messagesSent,
      clicks: p.linkClicks,
      orders: p.ordersCount,
    }));

    // 6. Traffic Source Breakdown (Pie chart)
    const trafficSources = [
      { name: "Reel Comment Trigger", value: 68, color: "#635BDB" },
      { name: "Story Reply Concierge", value: 16, color: "#3B82F6" },
      { name: "Direct Message Keyword", value: 11, color: "#10B981" },
      { name: "Instagram Live Comments", value: 5, color: "#F59E0B" },
    ];

    // Top Automations Table
    const topAutomations = db.state.automations.slice(0, 5).map((a) => {
      const ctr = a.messagesSent > 0 ? ((a.linkClicks / a.messagesSent) * 100).toFixed(1) : 0;
      return {
        id: a.id,
        name: a.name,
        triggers: a.executions,
        messages: a.messagesSent,
        clicks: a.linkClicks,
        ctr: `${ctr}%`,
      };
    });

    // Top Products Table
    const topProducts = db.state.products.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      messages: p.messagesSent,
      clicks: p.linkClicks,
      orders: p.ordersCount,
      revenue: p.ordersCount * p.price,
    }));

    // Top Reels Table
    const topReels = db.state.reels
      .filter((r) => r.triggerCount > 0)
      .slice(0, 5)
      .map((r) => {
        const convRate = r.linkClicks > 0 ? ((r.conversions / r.linkClicks) * 100).toFixed(1) : 0;
        return {
          id: r.id,
          caption: r.caption,
          triggers: r.triggerCount,
          messages: r.dmsSent,
          clicks: r.linkClicks,
          conversionRate: `${convRate}%`,
        };
      });

    return {
      success: true,
      data: {
        stats,
        charts: {
          contactGrowthChart,
          messagesOverTimeChart,
          linkClickTrends,
          automationComparison,
          productPerformanceChart,
          trafficSources,
        },
        tables: {
          topAutomations,
          topProducts,
          topReels,
        },
      },
      message: "Analytics retrieved successfully",
    };
  },
};
