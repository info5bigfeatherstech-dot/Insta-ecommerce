import { db, delay } from "@/data/db";

export const settingsService = {
  async getSettings() {
    await delay(300);
    return {
      success: true,
      data: db.state.settings,
      message: "Settings retrieved",
    };
  },

  async updateGeneralSettings(data) {
    await delay(400);
    db.state.settings.general = { ...db.state.settings.general, ...data };
    db.persist();
    return {
      success: true,
      data: db.state.settings.general,
      message: "General settings updated successfully",
    };
  },

  async updateInstagramSettings(data) {
    await delay(400);
    db.state.settings.instagram = { ...db.state.settings.instagram, ...data };
    db.persist();
    return {
      success: true,
      data: db.state.settings.instagram,
      message: "Instagram account settings saved",
    };
  },

  async updateNotificationSettings(data) {
    await delay(350);
    db.state.settings.notifications = { ...db.state.settings.notifications, ...data };
    db.persist();
    return {
      success: true,
      data: db.state.settings.notifications,
      message: "Notification preferences saved",
    };
  },

  async inviteTeamMember(memberData) {
    await delay(450);
    const newMember = {
      id: `team_${Date.now()}`,
      name: memberData.name,
      email: memberData.email,
      role: memberData.role || "Operator",
      status: "invited",
      avatarColor: "#635BDB",
    };
    db.state.settings.team.push(newMember);
    db.persist();
    return {
      success: true,
      data: newMember,
      message: `Invitation sent to ${memberData.email}`,
    };
  },

  async removeTeamMember(id) {
    await delay(400);
    const index = db.state.settings.team.findIndex((m) => m.id === id);
    if (index === -1) return { success: false, data: null, message: "Member not found" };

    const removed = db.state.settings.team.splice(index, 1)[0];
    db.persist();
    return {
      success: true,
      data: removed,
      message: `${removed.name} removed from team`,
    };
  },
};
