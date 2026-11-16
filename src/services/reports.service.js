import { db, delay } from "@/data/db";

export const reportsService = {
  async getReportData(reportType = "automation_performance", dateRange = "30d") {
    await delay(350);

    let title = "Automation Performance Report";
    let description = "Detailed breakdown of triggers, delivery rates, and click-through metrics";
    let columns = [];
    let rows = [];

    switch (reportType) {
      case "automation_performance":
        title = "Automation Performance Report";
        description = "Breakdown of triggers, DM delivery status, CTR and direct conversions";
        columns = [
          { key: "name", label: "Automation Name" },
          { key: "triggerType", label: "Trigger Type" },
          { key: "executions", label: "Total Triggers" },
          { key: "messagesSent", label: "DMs Delivered" },
          { key: "linkClicks", label: "Link Clicks" },
          { key: "ctr", label: "CTR (%)" },
          { key: "conversions", label: "Orders" },
          { key: "status", label: "Status" },
        ];
        rows = db.state.automations.map((a) => {
          const ctr = a.messagesSent > 0 ? ((a.linkClicks / a.messagesSent) * 100).toFixed(1) : "0.0";
          return {
            name: a.name,
            triggerType: a.triggerType,
            executions: a.executions,
            messagesSent: a.messagesSent,
            linkClicks: a.linkClicks,
            ctr: `${ctr}%`,
            conversions: a.conversions,
            status: a.status,
          };
        });
        break;

      case "customer_growth":
        title = "Customer Growth & Acquisition Report";
        description = "Customer discovery source, engagement frequency, and lifetime value";
        columns = [
          { key: "name", label: "Customer Name" },
          { key: "username", label: "Instagram Handle" },
          { key: "city", label: "City" },
          { key: "firstInteraction", label: "First Seen" },
          { key: "totalMessages", label: "Total Messages" },
          { key: "ordersCount", label: "Orders" },
          { key: "lifetimeSpend", label: "Spend (INR)" },
          { key: "status", label: "Status" },
        ];
        rows = db.state.customers.map((c) => ({
          name: c.name,
          username: c.username,
          city: c.city,
          firstInteraction: c.firstInteraction.slice(0, 10),
          totalMessages: c.totalMessages,
          ordersCount: c.ordersCount,
          lifetimeSpend: `₹${c.lifetimeSpend.toLocaleString("en-IN")}`,
          status: c.status,
        }));
        break;

      case "product_performance":
        title = "Product Sales & DM Interest Report";
        description = "Inquiries received via DM vs actual orders placed and revenue generated";
        columns = [
          { key: "name", label: "Product Name" },
          { key: "sku", label: "SKU" },
          { key: "price", label: "Price (INR)" },
          { key: "messagesSent", label: "DMs Sent" },
          { key: "linkClicks", label: "Clicks" },
          { key: "ordersCount", label: "Orders" },
          { key: "stock", label: "Stock Left" },
        ];
        rows = db.state.products.map((p) => ({
          name: p.name,
          sku: p.sku,
          price: `₹${p.price.toLocaleString("en-IN")}`,
          messagesSent: p.messagesSent,
          linkClicks: p.linkClicks,
          ordersCount: p.ordersCount,
          stock: p.stock,
        }));
        break;

      case "reel_performance":
        title = "Reels & Posts Attribution Report";
        description = "Organic video metrics, keyword triggers generated, and sales conversions";
        columns = [
          { key: "postId", label: "Post ID" },
          { key: "caption", label: "Caption Preview" },
          { key: "views", label: "Views" },
          { key: "comments", label: "Comments" },
          { key: "triggers", label: "Triggers" },
          { key: "clicks", label: "Clicks" },
          { key: "conversions", label: "Conversions" },
        ];
        rows = db.state.reels.map((r) => ({
          postId: r.instagramPostId,
          caption: r.caption.slice(0, 45) + "...",
          views: r.views.toLocaleString("en-IN"),
          comments: r.commentsCount,
          triggers: r.triggerCount,
          clicks: r.linkClicks,
          conversions: r.conversions,
        }));
        break;

      case "dm_delivery":
        title = "Direct Message Delivery & SLA Report";
        description = "API throughput, message delivery rate, and user read/click timestamps";
        columns = [
          { key: "recipient", label: "Recipient" },
          { key: "automation", label: "Automation" },
          { key: "sentTime", label: "Dispatched" },
          { key: "deliveryStatus", label: "Delivery" },
          { key: "clickStatus", label: "Clicked" },
        ];
        rows = db.state.dmActivity.map((d) => ({
          recipient: `${d.customerName} (${d.username})`,
          automation: d.automationName,
          sentTime: d.sentTime.replace("T", " ").slice(0, 16),
          deliveryStatus: d.deliveryStatus,
          clickStatus: d.clickStatus,
        }));
        break;

      case "revenue_attribution":
        title = "Revenue Attribution Report";
        description = "Orders placed directly through Instagram DM automation links";
        columns = [
          { key: "orderNumber", label: "Order #" },
          { key: "customer", label: "Customer" },
          { key: "amount", label: "Amount (INR)" },
          { key: "paymentStatus", label: "Payment" },
          { key: "fulfillment", label: "Fulfillment" },
          { key: "sourceReel", label: "Source Reel" },
          { key: "date", label: "Date" },
        ];
        rows = db.state.orders.map((o) => ({
          orderNumber: o.orderNumber,
          customer: o.customerName,
          amount: `₹${o.totalAmount.toLocaleString("en-IN")}`,
          paymentStatus: o.paymentStatus,
          fulfillment: o.fulfillmentStatus,
          sourceReel: o.instagramAttribution?.sourceReelId || "Direct",
          date: o.createdAt.slice(0, 10),
        }));
        break;
    }

    return {
      success: true,
      data: {
        reportType,
        title,
        description,
        columns,
        rows,
        generatedAt: new Date().toISOString(),
      },
      message: "Report generated successfully",
    };
  },
};
