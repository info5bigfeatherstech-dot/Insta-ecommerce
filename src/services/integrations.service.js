import { db, delay } from "@/data/db";

export const integrationsService = {
  async getIntegrations() {
    await delay(300);
    return {
      success: true,
      data: db.state.integrations,
      message: "Integrations retrieved",
    };
  },

  async toggleIntegration(id) {
    await delay(450);
    const item = db.state.integrations.find((i) => i.id === id);
    if (!item) return { success: false, data: null, message: "Integration not found" };

    const newStatus = item.status === "connected" ? "disconnected" : "connected";
    item.status = newStatus;
    item.lastSynced = newStatus === "connected" ? new Date().toISOString() : null;

    db.persist();

    return {
      success: true,
      data: item,
      message: `${item.name} is now ${newStatus}`,
    };
  },

  async updateIntegrationConfig(id, config) {
    await delay(400);
    const item = db.state.integrations.find((i) => i.id === id);
    if (!item) return { success: false, data: null, message: "Integration not found" };

    item.config = { ...item.config, ...config };
    db.persist();

    return {
      success: true,
      data: item,
      message: `Configuration for ${item.name} updated`,
    };
  },
};
