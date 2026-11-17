import { db, delay } from "@/data/db";

export const productsService = {
  async getProducts(params = {}) {
    await delay(350);
    const {
      search = "",
      category = "all",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 12,
    } = params;

    let products = db.state.products.map((p) => {
      const cat = db.state.categories.find((c) => c.id === p.categoryId);
      return {
        ...p,
        categoryName: cat ? cat.name : "Uncategorized",
      };
    });

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (category && category !== "all") {
      products = products.filter((p) => p.categoryId === category);
    }

    if (status && status !== "all") {
      products = products.filter((p) => p.status === status);
    }

    // Sort
    products.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "price" || sortBy === "stock" || sortBy === "messagesSent" || sortBy === "linkClicks") {
        return sortOrder === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      }
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const totalRecords = products.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = products.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        products: paginated,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalRecords,
          totalPages,
        },
      },
      message: "Products retrieved successfully",
    };
  },

  async getProductById(id) {
    await delay(250);
    const product = db.state.products.find((p) => p.id === id);
    if (!product) return { success: false, data: null, message: "Product not found" };
    const category = db.state.categories.find((c) => c.id === product.categoryId);

    // Linked Reels and Automations
    const linkedReels = db.state.reels.filter((r) => r.productId === id);
    const linkedAutomations = db.state.automations.filter((a) => a.productId === id);

    // Attributed orders & revenue
    const productOrders = db.state.orders.filter(
      (o) => o.items && o.items.some((item) => item.productId === id)
    );
    const ordersCount = productOrders.length;
    const revenue = productOrders.reduce((sum, o) => {
      const item = o.items.find((it) => it.productId === id);
      return sum + (item ? Number(item.price || 0) * Number(item.quantity || 1) : 0);
    }, 0);

    return {
      success: true,
      data: {
        ...product,
        categoryName: category ? category.name : "Uncategorized",
        category,
        linkedReels,
        linkedAutomations,
        ordersCount,
        revenue,
      },
      message: "Product found",
    };
  },

  async createProduct(productData) {
    await delay(450);
    const newId = `prod_${Date.now()}`;
    const newProduct = {
      id: newId,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: productData.name,
      description: productData.description || "",
      categoryId: productData.categoryId,
      price: Number(productData.price),
      compareAtPrice: Number(productData.compareAtPrice || productData.price),
      stock: Number(productData.stock || 0),
      status: productData.status || "active",
      productUrl: productData.productUrl || `https://urbanstyle.in/products/${newId}`,
      messagesSent: 0,
      linkClicks: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.state.products.unshift(newProduct);
    db.persist();

    return {
      success: true,
      data: newProduct,
      message: `Product "${newProduct.name}" created successfully`,
    };
  },

  async updateProduct(id, productData) {
    await delay(450);
    const index = db.state.products.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, data: null, message: "Product not found" };

    const updated = {
      ...db.state.products[index],
      ...productData,
      price: Number(productData.price ?? db.state.products[index].price),
      stock: Number(productData.stock ?? db.state.products[index].stock),
      updatedAt: new Date().toISOString(),
    };

    db.state.products[index] = updated;
    db.persist();

    return {
      success: true,
      data: updated,
      message: `Product "${updated.name}" updated successfully`,
    };
  },

  async deleteProduct(id) {
    await delay(400);
    const index = db.state.products.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, data: null, message: "Product not found" };

    const removed = db.state.products.splice(index, 1)[0];
    db.persist();

    return {
      success: true,
      data: removed,
      message: `Product "${removed.name}" deleted successfully`,
    };
  },
};
