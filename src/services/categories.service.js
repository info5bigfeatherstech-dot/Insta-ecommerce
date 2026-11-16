import { db, delay } from "@/data/db";

export const categoriesService = {
  async getCategories(params = {}) {
    await delay(300);
    const { search = "", sortBy = "displayOrder", sortOrder = "asc" } = params;

    let categories = db.getCategoriesWithStats();

    if (search) {
      const q = search.toLowerCase();
      categories = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    categories.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "productCount" || sortBy === "displayOrder") {
        return sortOrder === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      }
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return {
      success: true,
      data: categories,
      message: "Categories retrieved successfully",
    };
  },

  async createCategory(catData) {
    await delay(400);
    const newId = `cat_${Date.now()}`;
    const newCat = {
      id: newId,
      name: catData.name,
      slug: catData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: catData.description || "",
      displayOrder: Number(catData.displayOrder || db.state.categories.length + 1),
      status: catData.status || "active",
      createdAt: new Date().toISOString(),
    };

    db.state.categories.push(newCat);
    db.persist();

    return {
      success: true,
      data: { ...newCat, productCount: 0 },
      message: `Category "${newCat.name}" created`,
    };
  },

  async updateCategory(id, catData) {
    await delay(400);
    const index = db.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, data: null, message: "Category not found" };

    const updated = {
      ...db.state.categories[index],
      ...catData,
      displayOrder: Number(catData.displayOrder ?? db.state.categories[index].displayOrder),
    };

    db.state.categories[index] = updated;
    db.persist();

    return {
      success: true,
      data: updated,
      message: `Category "${updated.name}" updated`,
    };
  },

  async deleteCategory(id) {
    await delay(400);
    const index = db.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, data: null, message: "Category not found" };

    const removed = db.state.categories.splice(index, 1)[0];
    db.persist();

    return {
      success: true,
      data: removed,
      message: `Category "${removed.name}" deleted`,
    };
  },
};
