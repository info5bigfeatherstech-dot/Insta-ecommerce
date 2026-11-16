import { db, delay } from "@/data/db";

export const tagsService = {
  async getTags() {
    await delay(300);
    const tags = db.getTagsWithStats();
    return {
      success: true,
      data: tags,
      message: "Tags retrieved",
    };
  },

  async createTag(tagData) {
    await delay(400);
    const newId = `tag_${Date.now()}`;
    const newTag = {
      id: newId,
      name: tagData.name,
      color: tagData.color || "#635BDB",
      bgColor: tagData.bgColor || "#EEF2FF",
      description: tagData.description || "",
      createdAt: new Date().toISOString(),
    };

    db.state.tags.push(newTag);
    db.persist();

    return {
      success: true,
      data: { ...newTag, contactCount: 0 },
      message: `Tag "${newTag.name}" created`,
    };
  },

  async updateTag(id, tagData) {
    await delay(400);
    const index = db.state.tags.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, data: null, message: "Tag not found" };

    const updated = {
      ...db.state.tags[index],
      ...tagData,
    };

    db.state.tags[index] = updated;
    db.persist();

    return {
      success: true,
      data: updated,
      message: `Tag "${updated.name}" updated`,
    };
  },

  async deleteTag(id) {
    await delay(400);
    const index = db.state.tags.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, data: null, message: "Tag not found" };

    const removed = db.state.tags.splice(index, 1)[0];

    // Remove this tag from all customers
    db.state.customers.forEach((c) => {
      if (c.tags) {
        c.tags = c.tags.filter((t) => t !== id);
      }
    });

    db.persist();

    return {
      success: true,
      data: removed,
      message: `Tag "${removed.name}" deleted`,
    };
  },

  // Segments
  async getSegments() {
    await delay(300);
    const segments = db.getSegmentsWithStats();
    return {
      success: true,
      data: segments,
      message: "Segments retrieved",
    };
  },

  async createSegment(segData) {
    await delay(450);
    const newId = `seg_${Date.now()}`;
    const newSegment = {
      id: newId,
      name: segData.name,
      description: segData.description || "",
      color: segData.color || "#635BDB",
      icon: segData.icon || "Users",
      conditions: segData.conditions || [{ field: "status", operator: "equals", value: "active" }],
    };

    db.state.segments.push(newSegment);
    db.persist();

    return {
      success: true,
      data: newSegment,
      message: `Segment "${newSegment.name}" created`,
    };
  },
};
