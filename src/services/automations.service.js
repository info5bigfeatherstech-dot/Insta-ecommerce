import { db, delay } from "@/data/db";
import {
  migrateAutomationToWorkflow,
  generateSeedExecutions,
  runWorkflow,
} from "@/lib/workflow-engine";

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

    // Migrate to workflow graph if not yet structured
    if (!auto.workflow || !auto.workflow.nodes || auto.workflow.nodes.length === 0) {
      auto.workflow = migrateAutomationToWorkflow(auto);
    }

    // Seed realistic executions if not present
    if (!auto.executionsList || auto.executionsList.length === 0) {
      auto.executionsList = generateSeedExecutions(auto.id, 18);
    }

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

  async saveWorkflow(id, { nodes, edges, viewport }) {
    await delay(350);
    const index = db.state.automations.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, data: null, message: "Automation not found" };

    const auto = db.state.automations[index];
    auto.workflow = { nodes, edges, viewport };
    auto.lastUpdated = new Date().toISOString();

    // Synchronize Trigger keyword with associated Reel if a reel comment trigger exists
    const triggerNode = nodes.find((n) => n.data?.category === "trigger" || n.type?.startsWith("trigger_"));
    if (triggerNode && triggerNode.data?.config) {
      const cfg = triggerNode.data.config;
      if (cfg.keywords && cfg.keywords.length > 0) {
        auto.triggerKeywords = cfg.keywords;
        auto.triggerKeyword = cfg.keywords[0];
      }
      if (cfg.reelId) {
        auto.reelId = cfg.reelId;
      }
    }

    // Synchronize DM message template
    const dmNode = nodes.find((n) => n.data?.nodeType === "action_send_dm");
    if (dmNode && dmNode.data?.config?.messageText) {
      auto.messageTemplate = dmNode.data.config.messageText;
    }

    // Sync to linked Reel
    if (auto.reelId) {
      const reel = db.state.reels.find((r) => r.id === auto.reelId);
      if (reel) {
        reel.automationId = id;
        if (auto.triggerKeywords) reel.triggerKeywords = auto.triggerKeywords;
        if (auto.messageTemplate) reel.messageTemplate = auto.messageTemplate;
      }
    }

    db.persist();

    return {
      success: true,
      data: auto,
      message: "Workflow canvas saved successfully",
    };
  },

  async toggleAutomationActive(id) {
    return this.toggleAutomationStatus(id);
  },

  async runWorkflowSimulation(id, triggerPayload) {
    await delay(400);
    const auto = db.state.automations.find((a) => a.id === id);
    if (!auto) return { success: false, data: null, message: "Automation not found" };

    const workflow = auto.workflow || migrateAutomationToWorkflow(auto);
    const execution = runWorkflow(workflow, triggerPayload, {
      executeSideEffects: true,
      automationId: id,
    });

    if (!auto.executionsList) {
      auto.executionsList = generateSeedExecutions(id, 16);
    }
    auto.executionsList.unshift(execution);
    auto.executions = (auto.executions || 0) + 1;
    if (execution.success) {
      auto.messagesSent = (auto.messagesSent || 0) + 1;
    } else {
      auto.failedCount = (auto.failedCount || 0) + 1;
    }
    auto.lastUpdated = new Date().toISOString();

    db.persist();

    return {
      success: execution.success,
      data: execution,
      message: execution.success ? "Workflow simulation succeeded" : `Workflow simulation failed: ${execution.error}`,
    };
  },

  async getExecutions(id, params = {}) {
    await delay(200);
    const auto = db.state.automations.find((a) => a.id === id);
    if (!auto) return { success: false, data: [], message: "Automation not found" };

    if (!auto.executionsList || auto.executionsList.length === 0) {
      auto.executionsList = generateSeedExecutions(id, 18);
    }

    let list = [...auto.executionsList];
    const { status, search } = params;

    if (status && status !== "all") {
      list = list.filter((e) => e.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.triggerPayload?.username?.toLowerCase().includes(q) ||
          e.triggerPayload?.commentText?.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: list,
      total: list.length,
      message: "Executions retrieved successfully",
    };
  },

  async getExecutionById(automationId, execId) {
    await delay(150);
    const auto = db.state.automations.find((a) => a.id === automationId);
    if (!auto) return { success: false, data: null, message: "Automation not found" };

    const exec = (auto.executionsList || []).find((e) => e.id === execId);
    if (!exec) return { success: false, data: null, message: "Execution not found" };

    return {
      success: true,
      data: exec,
      message: "Execution found",
    };
  },

  async exportWorkflow(id) {
    const auto = db.state.automations.find((a) => a.id === id);
    if (!auto) return { success: false, data: null, message: "Automation not found" };

    const workflow = auto.workflow || migrateAutomationToWorkflow(auto);
    const exportData = {
      name: auto.name,
      status: auto.status,
      workflow,
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
    };

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
      message: "Workflow exported",
    };
  },

  async importWorkflow(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.workflow || !parsed.workflow.nodes || !parsed.workflow.edges) {
        return { success: false, data: null, message: "Invalid workflow JSON schema" };
      }
      return {
        success: true,
        data: parsed.workflow,
        message: "Workflow parsed successfully",
      };
    } catch (err) {
      return { success: false, data: null, message: "Malformed JSON file" };
    }
  },
};
