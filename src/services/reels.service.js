import { db, delay } from "@/data/db";
import { matchComment, renderTemplate, DEFAULT_PUBLIC_REPLIES } from "@/lib/comment-matcher";
import { getInitials } from "@/lib/utils";

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
          (r.product && r.product.name.toLowerCase().includes(q)) ||
          (r.triggerKeywords && r.triggerKeywords.some((k) => k.toLowerCase().includes(q)))
      );
    }

    if (filter === "active") {
      reels = reels.filter((r) => r.status === "active" || (r.automation && r.automation.status === "active"));
    } else if (filter === "inactive") {
      reels = reels.filter((r) => r.status === "inactive" || (r.automation && r.automation.status === "inactive"));
    } else if (filter === "unassigned") {
      reels = reels.filter((r) => !r.automationId || !r.triggerKeywords || r.triggerKeywords.length === 0);
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

    const reel = db.state.reels[reelIndex];
    reel.automationId = automationId || null;
    reel.status = automationId ? "active" : "unassigned";

    // Synchronize keywords and settings from assigned automation
    if (automationId) {
      const autoIndex = db.state.automations.findIndex((a) => a.id === automationId);
      if (autoIndex !== -1) {
        const auto = db.state.automations[autoIndex];
        auto.reelId = reelId;
        if (auto.triggerKeywords && auto.triggerKeywords.length > 0) {
          reel.triggerKeywords = [...auto.triggerKeywords];
        } else if (auto.triggerKeyword) {
          reel.triggerKeywords = [auto.triggerKeyword];
        }
        if (auto.messageTemplate) reel.messageTemplate = auto.messageTemplate;
        if (auto.matchType) reel.matchType = auto.matchType;
        if (auto.linkType) reel.linkType = auto.linkType;
        if (auto.customUrl) reel.customUrl = auto.customUrl;
        reel.status = auto.status;
      }
    }

    db.persist();

    return {
      success: true,
      data: db.state.reels[reelIndex],
      message: automationId ? "Automation assigned to Reel" : "Automation removed from Reel",
    };
  },

  /**
   * Updates a Reel's comment trigger configuration.
   * If the Reel has no automation, creates one automatically and links it.
   * Keeps both the Reel and the Automation records synchronized.
   */
  async updateReelTrigger(reelId, triggerData) {
    await delay(400);
    const reelIndex = db.state.reels.findIndex((r) => r.id === reelId);
    if (reelIndex === -1) return { success: false, data: null, message: "Reel not found" };

    const reel = db.state.reels[reelIndex];
    const {
      triggerKeywords = [],
      matchType = "contains",
      messageTemplate = "",
      linkType = "product",
      customUrl = "",
      publicReplyEnabled = true,
      publicReplies = DEFAULT_PUBLIC_REPLIES,
      sendOncePerUser = true,
      status = "active",
    } = triggerData;

    // Filter duplicates and uppercase keywords
    const cleanKeywords = Array.from(
      new Set(triggerKeywords.map((k) => String(k).trim().toUpperCase()).filter(Boolean))
    );

    reel.triggerKeywords = cleanKeywords;
    reel.matchType = matchType;
    reel.messageTemplate = messageTemplate;
    reel.linkType = linkType;
    reel.customUrl = customUrl;
    reel.publicReplyEnabled = publicReplyEnabled;
    reel.publicReplies = publicReplies;
    reel.sendOncePerUser = sendOncePerUser;
    reel.status = status;

    const product = db.state.products.find((p) => p.id === reel.productId) || db.state.products[0];

    // If Reel has no linked automation, create one automatically
    if (!reel.automationId) {
      const newAutoId = `auto_${Date.now()}`;
      const primaryKeyword = cleanKeywords[0] || "LINK";
      const newAuto = {
        id: newAutoId,
        name: `${product?.name || "Reel"} - Comment '${primaryKeyword}'`,
        triggerType: "reel_comment",
        reelId: reelId,
        productId: reel.productId || product?.id,
        status: status,
        executions: reel.triggerCount || 0,
        messagesSent: reel.dmsSent || 0,
        linkClicks: reel.linkClicks || 0,
        conversions: reel.conversions || 0,
        failedCount: 0,
        lastUpdated: new Date().toISOString(),
        triggerKeyword: primaryKeyword,
        triggerKeywords: cleanKeywords,
        matchType: matchType,
        messageTemplate: messageTemplate,
        linkType: linkType,
        customUrl: customUrl,
        publicReplyEnabled: publicReplyEnabled,
        publicReplies: publicReplies,
        sendOncePerUser: sendOncePerUser,
        workflowConfig: {
          trigger: {
            keyword: primaryKeyword,
            caseSensitive: false,
            replyToCommentPublicly: publicReplyEnabled,
            publicCommentReply: publicReplies[0] || "Check your DMs! 📩",
          },
          identify_contact: { captureAvatar: true, autoCreateCustomer: true },
          find_product: { productId: reel.productId, checkStock: true },
          send_dm: { message: messageTemplate, buttonText: "Shop Now" },
          track_click: { utmSource: "instagram_automation" },
          update_activity: { addTags: ["tag_3", "tag_12"] },
        },
      };

      db.state.automations.unshift(newAuto);
      reel.automationId = newAutoId;
    } else {
      // Update existing linked automation
      const autoIdx = db.state.automations.findIndex((a) => a.id === reel.automationId);
      if (autoIdx !== -1) {
        const auto = db.state.automations[autoIdx];
        auto.triggerKeywords = cleanKeywords;
        auto.triggerKeyword = cleanKeywords[0] || auto.triggerKeyword || "LINK";
        auto.matchType = matchType;
        auto.messageTemplate = messageTemplate;
        auto.linkType = linkType;
        auto.customUrl = customUrl;
        auto.publicReplyEnabled = publicReplyEnabled;
        auto.publicReplies = publicReplies;
        auto.sendOncePerUser = sendOncePerUser;
        auto.status = status;
        auto.lastUpdated = new Date().toISOString();
      }
    }

    db.persist();

    return {
      success: true,
      data: {
        ...reel,
        product,
        automation: db.state.automations.find((a) => a.id === reel.automationId),
      },
      message: "Comment trigger configured successfully",
    };
  },

  /**
   * Retrieves comments on a Reel with optional status filter and search.
   */
  async getReelComments(reelId, params = {}) {
    await delay(200);
    const { status = "all", search = "" } = params;
    const reel = db.state.reels.find((r) => r.id === reelId);
    if (!reel) return { success: false, data: [], message: "Reel not found" };

    let comments = [...(reel.comments || [])];

    if (status && status !== "all") {
      comments = comments.filter((c) => c.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      comments = comments.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          (c.customerName && c.customerName.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: comments,
      message: "Comments retrieved",
    };
  },

  /**
   * Simulates a follower posting a comment on a Reel.
   * Evaluates the comment against Reel trigger rules, updates mock DB,
   * creates/updates customer, conversations, DM activity, and returns result.
   */
  async simulateComment({ reelId, username, commentText }) {
    await delay(350);
    const reel = db.state.reels.find((r) => r.id === reelId);
    if (!reel) return { success: false, message: "Reel not found" };

    const product = db.state.products.find((p) => p.id === reel.productId);
    const automation = db.state.automations.find((a) => a.id === reel.automationId);

    const cleanUsername = username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`;
    const cleanName = cleanUsername
      .replace(/^@/, "")
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // 1. Check if automation is active
    const isAutomationActive = reel.status === "active" && (!automation || automation.status === "active");
    if (!isAutomationActive) {
      const skippedComment = {
        id: `comm_${Date.now()}`,
        username: cleanUsername,
        customerName: cleanName,
        avatar: getInitials(cleanName),
        text: commentText,
        timestamp: new Date().toISOString(),
        status: "Skipped",
        reason: "Automation inactive",
        publicReply: null,
      };
      reel.comments = [skippedComment, ...(reel.comments || [])];
      reel.commentsCount = (reel.commentsCount || 0) + 1;
      db.persist();

      return {
        success: true,
        status: "skipped_inactive",
        data: { comment: skippedComment },
        message: "Comment posted (Skipped: Automation is inactive)",
      };
    }

    // 2. Check if once-per-user is enabled and user already received DM
    const sendOnce = reel.sendOncePerUser !== false;
    if (sendOnce) {
      const alreadySent = (reel.comments || []).some(
        (c) => c.username.toLowerCase() === cleanUsername.toLowerCase() && c.status === "DM Sent"
      );
      if (alreadySent) {
        const skippedComment = {
          id: `comm_${Date.now()}`,
          username: cleanUsername,
          customerName: cleanName,
          avatar: getInitials(cleanName),
          text: commentText,
          timestamp: new Date().toISOString(),
          status: "Skipped",
          reason: "DM already sent to this user",
          publicReply: null,
        };
        reel.comments = [skippedComment, ...(reel.comments || [])];
        reel.commentsCount = (reel.commentsCount || 0) + 1;
        db.persist();

        return {
          success: true,
          status: "skipped_duplicate",
          data: { comment: skippedComment },
          message: "Comment posted (Skipped: DM already sent to this user)",
        };
      }
    }

    // 3. Evaluate comment against trigger keywords and match type
    const matchResult = matchComment(commentText, {
      triggerKeywords: reel.triggerKeywords || (reel.triggerKeyword ? [reel.triggerKeyword] : []),
      matchType: reel.matchType || "contains",
    });

    if (!matchResult.matched) {
      const noTriggerComment = {
        id: `comm_${Date.now()}`,
        username: cleanUsername,
        customerName: cleanName,
        avatar: getInitials(cleanName),
        text: commentText,
        timestamp: new Date().toISOString(),
        status: "No Trigger",
        reason: "No keyword match",
        publicReply: null,
      };
      reel.comments = [noTriggerComment, ...(reel.comments || [])];
      reel.commentsCount = (reel.commentsCount || 0) + 1;
      db.persist();

      return {
        success: true,
        status: "no_trigger",
        data: { comment: noTriggerComment },
        message: "Comment posted (No keyword match)",
      };
    }

    // 4. Comment MATCHED! Run complete automated commerce flow:
    // A. Resolve or create Customer
    let customer = db.state.customers.find(
      (c) => c.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    const now = new Date().toISOString();

    if (!customer) {
      customer = {
        id: `cust_${Date.now()}`,
        name: cleanName,
        username: cleanUsername,
        instagramUserId: `ig_usr_${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `${cleanUsername.replace(/[@._]/g, "")}@gmail.com`,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: "Mumbai",
        status: "new",
        sourceReelId: reel.id,
        firstInteraction: now,
        lastInteraction: now,
        tags: ["tag_11", "tag_3", "tag_12"], // New Lead, Reel Lead, Product Link Sent
        interestedProductIds: reel.productId ? [reel.productId] : [],
        totalMessages: 1,
        linksSent: 1,
        linksClicked: 0,
        ordersCount: 0,
        lifetimeSpend: 0,
        customFields: {
          notes: `Acquired via Reel comment trigger "${commentText}"`,
          instagramBio: `Instagram shopper • ${cleanUsername}`,
        },
      };
      db.state.customers.unshift(customer);
    } else {
      customer.lastInteraction = now;
      customer.totalMessages = (customer.totalMessages || 0) + 1;
      customer.linksSent = (customer.linksSent || 0) + 1;
      if (!customer.tags.includes("tag_12")) {
        customer.tags.push("tag_12"); // Product Link Sent
      }
      if (reel.productId && !(customer.interestedProductIds || []).includes(reel.productId)) {
        customer.interestedProductIds = [...(customer.interestedProductIds || []), reel.productId];
      }
    }

    // B. Resolve product link
    let targetUrl = "https://urbanstyle.in";
    if (reel.linkType === "custom" && reel.customUrl) {
      targetUrl = reel.customUrl;
    } else if (product?.productUrl) {
      targetUrl = `${product.productUrl}?utm_source=ig_auto&utm_medium=reel_comment`;
    } else {
      targetUrl = `https://urbanstyle.in/products/item?utm_source=ig_auto`;
    }

    // C. Render DM from message template
    const templateToUse =
      reel.messageTemplate ||
      "Hey {{username}}! Tap below to shop {{product_name}}: {{product_url}}";

    const renderedDm = renderTemplate(templateToUse, {
      username: customer.username,
      product_name: product?.name || "Featured Product",
      product_price: product ? `₹${product.price.toLocaleString("en-IN")}` : "₹999",
      product_url: targetUrl,
    });

    // D. Update counters
    reel.triggerCount = (reel.triggerCount || 0) + 1;
    reel.dmsSent = (reel.dmsSent || 0) + 1;
    if (automation) {
      automation.executions = (automation.executions || 0) + 1;
      automation.messagesSent = (automation.messagesSent || 0) + 1;
      automation.lastUpdated = now;
    }
    if (product) {
      product.messagesSent = (product.messagesSent || 0) + 1;
    }

    // E. Append to Conversations (Inbox)
    let conv = db.state.conversations.find(
      (c) => c.customerId === customer.id || c.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: commentText,
      timestamp: now,
      status: "delivered",
    };

    const botMessage = {
      id: `msg_bot_${Date.now()}`,
      sender: "bot",
      text: renderedDm,
      timestamp: new Date(Date.now() + 1000).toISOString(),
      status: "delivered",
      isAutomation: true,
    };

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        username: customer.username,
        unread: false,
        status: "active",
        assignedTo: "Automation Bot",
        lastMessage: renderedDm,
        lastMessageTimestamp: now,
        messages: [userMessage, botMessage],
      };
      db.state.conversations.unshift(conv);
    } else {
      conv.messages.push(userMessage, botMessage);
      conv.lastMessage = renderedDm;
      conv.lastMessageTimestamp = now;
    }

    // F. Append DM Activity
    const dmaId = `dma_${Date.now()}`;
    const dmActivityRecord = {
      id: dmaId,
      customerId: customer.id,
      customerName: customer.name,
      username: customer.username,
      automationId: automation?.id || "auto_comment",
      automationName: automation?.name || `${reel.caption.slice(0, 24)}... Trigger`,
      message: renderedDm,
      productLink: targetUrl,
      sentTime: now,
      deliveryStatus: "delivered",
      clickStatus: "not_clicked",
      clickedTime: null,
    };
    db.state.dmActivity.unshift(dmActivityRecord);

    // G. Public comment reply (if enabled)
    let publicReplyText = null;
    if (reel.publicReplyEnabled) {
      const replies =
        reel.publicReplies && reel.publicReplies.length > 0
          ? reel.publicReplies
          : DEFAULT_PUBLIC_REPLIES;
      publicReplyText = replies[Math.floor(Math.random() * replies.length)];
    }

    // H. Add comment record to Reel
    const commentRecord = {
      id: `comm_${Date.now()}`,
      username: customer.username,
      customerName: customer.name,
      avatar: getInitials(customer.name),
      text: commentText,
      timestamp: now,
      status: "DM Sent",
      dmActivityId: dmaId,
      publicReply: publicReplyText,
      sentDm: {
        text: renderedDm,
        productUrl: targetUrl,
        dmActivityId: dmaId,
      },
    };
    reel.comments = [commentRecord, ...(reel.comments || [])];
    reel.commentsCount = (reel.commentsCount || 0) + 1;

    db.persist();

    return {
      success: true,
      status: "match",
      data: {
        comment: commentRecord,
        sentDm: {
          text: renderedDm,
          productUrl: targetUrl,
          dmActivityId: dmaId,
        },
        publicReply: publicReplyText,
        customer,
      },
      message: `DM sent to ${customer.username}`,
    };
  },

  /**
   * Simulates a user clicking the product URL in an automated DM.
   * Increments link clicks on Reel, Automation, Product, Customer,
   * adds the "Link Clicked" tag to the customer, and persists changes.
   */
  async simulateLinkClick({ dmActivityId, reelId }) {
    await delay(300);
    const dmActivity = db.state.dmActivity.find((d) => d.id === dmActivityId);
    if (!dmActivity) {
      return { success: false, message: "DM Activity record not found" };
    }

    if (dmActivity.clickStatus === "clicked") {
      return { success: true, data: dmActivity, message: "Link was already recorded as clicked" };
    }

    const now = new Date().toISOString();
    dmActivity.clickStatus = "clicked";
    dmActivity.clickedTime = now;

    // 1. Reel
    const reel = db.state.reels.find((r) => r.id === reelId || r.automationId === dmActivity.automationId);
    if (reel) {
      reel.linkClicks = (reel.linkClicks || 0) + 1;
    }

    // 2. Automation
    const auto = db.state.automations.find((a) => a.id === dmActivity.automationId);
    if (auto) {
      auto.linkClicks = (auto.linkClicks || 0) + 1;
    }

    // 3. Product
    const productId = reel?.productId || auto?.productId;
    if (productId) {
      const product = db.state.products.find((p) => p.id === productId);
      if (product) {
        product.linkClicks = (product.linkClicks || 0) + 1;
      }
    }

    // 4. Customer
    const customer = db.state.customers.find((c) => c.id === dmActivity.customerId);
    if (customer) {
      customer.linksClicked = (customer.linksClicked || 0) + 1;
      if (!customer.tags.includes("tag_13")) {
        customer.tags.push("tag_13"); // "Link Clicked"
      }
    }

    db.persist();

    return {
      success: true,
      data: { dmActivity },
      message: "Link click recorded! Stats updated across Reel, Automation & Dashboard.",
    };
  },
};
