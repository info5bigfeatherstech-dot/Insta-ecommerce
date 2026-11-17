import { db, delay } from "@/data/db";

export const automationsService = {
  async getAutomations(params = {}) {
    await delay(350);
    const { search = "", status = "all", triggerType = "all", sortBy = "lastUpdated", sortOrder = "desc" } = params;

    let automations = db.state.automations.map((a) => {
      const reel = db.state.reels.find((r) => r.id === a.reelId);
      const product = db.state.products.find((p) => p.id === a.productId);
      return {
        ...a,
        reel,
        product,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      automations = automations.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.triggerKeyword && a.triggerKeyword.toLowerCase().includes(q)) ||
          (a.product && a.product.name.toLowerCase().includes(q))
      );
    }

    if (status && status !== "all") {
      automations = automations.filter((a) => a.status === status);
    }

    if (triggerType && triggerType !== "all") {
      automations = automations.filter((a) => a.triggerType === triggerType);
    }

    automations.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "executions" || sortBy === "messagesSent" || sortBy === "linkClicks") {
        return sortOrder === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      }
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const all = db.state.automations;
    const totalExecutions = all.reduce((sum, a) => sum + (a.executions || 0), 0);
    const totalFailed = all.reduce((sum, a) => sum + (a.failedCount || 0), 0);
    const totalSuccessful = totalExecutions - totalFailed;

    const stats = {
      total: all.length,
      active: all.filter((a) => a.status === "active").length,
      executions: totalExecutions,
      successful: totalSuccessful,
      failed: totalFailed,
    };

    return {
      success: true,
      data: {
        automations,
        stats,
      },
      message: "Automations retrieved successfully",
    };
  },

  async getAutomationById(id) {
    await delay(300);
    const auto = db.state.automations.find((a) => a.id === id);
    if (!auto) return { success: false, data: null, message: "Automation not found" };

    const reel = db.state.reels.find((r) => r.id === auto.reelId);
    const product = db.state.products.find((p) => p.id === auto.productId);

    return {
      success: true,
      data: {
        ...auto,
        reel,
        product,
      },
      message: "Automation found",
    };
  },

  async createAutomation(data) {
    await delay(500);
    const newId = `auto_${Date.now()}`;
    const newAuto = {
      id: newId,
      name: data.name || "New Automation",
      triggerType: data.triggerType || "reel_comment",
      reelId: data.reelId || null,
      productId: data.productId || db.state.products[0]?.id,
      status: data.status || "active",
      executions: 0,
      messagesSent: 0,
      linkClicks: 0,
      conversions: 0,
      failedCount: 0,
      lastUpdated: new Date().toISOString(),
      triggerKeyword: data.triggerKeyword || "BUY",
      messageTemplate: data.messageTemplate || "Hey {{username}}! Tap below to get {{product_name}}: {{product_url}}",
      workflowConfig: data.workflowConfig || {
        trigger: { keyword: data.triggerKeyword || "BUY", replyToCommentPublicly: true },
        identify_contact: { captureAvatar: true, autoCreateCustomer: true },
        find_product: { productId: data.productId, checkStock: true },
        send_dm: { message: data.messageTemplate, buttonText: "Shop Now" },
        track_click: { utmSource: "ig_automation" },
        update_activity: { addTags: ["tag_3"] },
      },
    };

    db.state.automations.unshift(newAuto);

    // If reelId is provided, link reel to this automation
    if (newAuto.reelId) {
      const rIdx = db.state.reels.findIndex((r) => r.id === newAuto.reelId);
      if (rIdx !== -1) {
        db.state.reels[rIdx].automationId = newId;
        db.state.reels[rIdx].status = "active";
      }
    }

    db.persist();

    return {
      success: true,
      data: newAuto,
      message: `Automation "${newAuto.name}" created successfully`,
    };
  },

  async updateAutomation(id, data) {
    await delay(450);
    const index = db.state.automations.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, data: null, message: "Automation not found" };

    const updated = {
      ...db.state.automations[index],
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    db.state.automations[index] = updated;

    // Synchronize Reel link and settings if linked
    const targetReelId = updated.reelId;
    if (targetReelId) {
      const rIdx = db.state.reels.findIndex((r) => r.id === targetReelId);
      if (rIdx !== -1) {
        db.state.reels[rIdx].automationId = id;
        db.state.reels[rIdx].status = updated.status;
        if (updated.triggerKeywords && updated.triggerKeywords.length > 0) {
          db.state.reels[rIdx].triggerKeywords = updated.triggerKeywords;
        } else if (updated.triggerKeyword) {
          db.state.reels[rIdx].triggerKeywords = [updated.triggerKeyword];
        }
        if (updated.messageTemplate) db.state.reels[rIdx].messageTemplate = updated.messageTemplate;
      }
    }

    db.persist();

    return {
      success: true,
      data: updated,
      message: `Automation "${updated.name}" updated successfully`,
    };
  },

  async toggleAutomationStatus(id) {
    await delay(350);
    const index = db.state.automations.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, data: null, message: "Automation not found" };

    const newStatus = db.state.automations[index].status === "active" ? "inactive" : "active";
    db.state.automations[index].status = newStatus;
    db.state.automations[index].lastUpdated = new Date().toISOString();

    const auto = db.state.automations[index];
    if (auto.reelId) {
      const rIdx = db.state.reels.findIndex((r) => r.id === auto.reelId);
      if (rIdx !== -1) {
        db.state.reels[rIdx].status = newStatus;
      }
    }

    db.persist();

    return {
      success: true,
      data: db.state.automations[index],
      message: `Automation is now ${newStatus}`,
    };
  },

  async duplicateAutomation(id) {
    await delay(400);
    const orig = db.state.automations.find((a) => a.id === id);
    if (!orig) return { success: false, data: null, message: "Automation not found" };

    const newId = `auto_${Date.now()}`;
    const duplicated = {
      ...JSON.parse(JSON.stringify(orig)),
      id: newId,
      name: `${orig.name} (Copy)`,
      status: "inactive",
      executions: 0,
      messagesSent: 0,
      linkClicks: 0,
      conversions: 0,
      failedCount: 0,
      lastUpdated: new Date().toISOString(),
    };

    db.state.automations.unshift(duplicated);
    db.persist();

    return {
      success: true,
      data: duplicated,
      message: `Automation duplicated as "${duplicated.name}"`,
    };
  },

  async deleteAutomation(id) {
    await delay(400);
    const index = db.state.automations.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, data: null, message: "Automation not found" };

    const removed = db.state.automations.splice(index, 1)[0];

    // Unlink any reel pointing to this automation
    db.state.reels.forEach((r) => {
      if (r.automationId === id) {
        r.automationId = null;
        r.status = "unassigned";
      }
    });

    db.persist();

    return {
      success: true,
      data: removed,
      message: `Automation "${removed.name}" deleted successfully`,
    };
  },
};
