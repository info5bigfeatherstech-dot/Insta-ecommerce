import { db, delay } from "@/data/db";

export const reelsService = {
  async getReels(params = {}) {
    await delay(350);
    const { search = "", filter = "all", sortBy = "publishedDate", sortOrder = "desc" } = params;

    let reels = db.state.reels.map((r) => {
      const product = db.state.products.find((p) => p.id === r.productId);
      const automation = db.state.automations.find((a) => a.id === r.automationId);
      return {
        ...r,
        product,
        automation,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      reels = reels.filter(
        (r) =>
          r.caption.toLowerCase().includes(q) ||
          r.instagramPostId.toLowerCase().includes(q) ||
          (r.product && r.product.name.toLowerCase().includes(q))
      );
    }

    if (filter === "active") {
      reels = reels.filter((r) => r.automation && r.automation.status === "active");
    } else if (filter === "inactive") {
      reels = reels.filter((r) => r.automation && r.automation.status === "inactive");
    } else if (filter === "unassigned") {
      reels = reels.filter((r) => !r.automationId);
    }

    reels.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "triggerCount" || sortBy === "dmsSent" || sortBy === "linkClicks" || sortBy === "conversions") {
        return sortOrder === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      }
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return {
      success: true,
      data: reels,
      message: "Reels retrieved successfully",
    };
  },

  async getReelById(id) {
    await delay(250);
    const reel = db.state.reels.find((r) => r.id === id);
    if (!reel) return { success: false, data: null, message: "Reel not found" };

    const product = db.state.products.find((p) => p.id === reel.productId);
    const automation = db.state.automations.find((a) => a.id === reel.automationId);
    
    // Recent trigger activities for this reel
    const activity = db.state.dmActivity
      .filter((dma) => dma.automationId === reel.automationId)
      .slice(0, 8);

    return {
      success: true,
      data: {
        ...reel,
        product,
        automation,
        activity,
      },
      message: "Reel found",
    };
  },

  async assignAutomationToReel(reelId, automationId) {
    await delay(450);
    const reelIndex = db.state.reels.findIndex((r) => r.id === reelId);
    if (reelIndex === -1) return { success: false, data: null, message: "Reel not found" };

    db.state.reels[reelIndex].automationId = automationId || null;
    db.state.reels[reelIndex].status = automationId ? "active" : "unassigned";

    // If an automation is assigned, update the automation's reelId as well for referential integrity
    if (automationId) {
      const autoIndex = db.state.automations.findIndex((a) => a.id === automationId);
      if (autoIndex !== -1) {
        db.state.automations[autoIndex].reelId = reelId;
      }
    }

    db.persist();

    return {
      success: true,
      data: db.state.reels[reelIndex],
      message: automationId ? "Automation assigned to Reel" : "Automation removed from Reel",
    };
  },
};
