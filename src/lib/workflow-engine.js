import { db } from "@/data/db";
import { formatINR, getInitials } from "@/lib/utils";
import { matchComment, renderTemplate } from "@/lib/comment-matcher";

/**
 * Default sample trigger payload for testing
 */
export const DEFAULT_TRIGGER_PAYLOAD = {
  username: "@priya_sharma_98",
  customerName: "Priya Sharma",
  commentText: "GOLD",
  commentId: "comm_test_101",
  reelId: "reel_1",
  productId: "prod_2",
  timestamp: new Date().toISOString(),
  profilePic: null,
};

/**
 * Evaluates an IF condition
 */
function evaluateIfCondition(leftVal, operator, rightVal) {
  const l = String(leftVal ?? "").toLowerCase().trim();
  const r = String(rightVal ?? "").toLowerCase().trim();

  switch (operator) {
    case "equals":
      return l === r;
    case "not_equals":
      return l !== r;
    case "contains":
      return l.includes(r);
    case "not_contains":
      return !l.includes(r);
    case "greater_than":
      return Number(leftVal || 0) > Number(rightVal || 0);
    case "less_than":
      return Number(leftVal || 0) < Number(rightVal || 0);
    case "is_empty":
      return !leftVal || leftVal === "" || (Array.isArray(leftVal) && leftVal.length === 0);
    case "is_not_empty":
      return Boolean(leftVal && leftVal !== "" && (!Array.isArray(leftVal) || leftVal.length > 0));
    default:
      return Boolean(leftVal);
  }
}

/**
 * Validates a workflow graph:
 * - Exactly one trigger node
 * - Every non-trigger node must have at least one incoming edge
 * - No cycles
 * - Required parameters filled
 */
export function validateWorkflow(workflow) {
  const nodes = workflow?.nodes || [];
  const edges = workflow?.edges || [];
  const errors = [];

  const triggerNodes = nodes.filter((n) => n.data?.category === "trigger" || n.type?.startsWith("trigger_"));
  if (triggerNodes.length === 0) {
    errors.push("Workflow must contain exactly one Trigger node.");
  } else if (triggerNodes.length > 1) {
    errors.push(`Workflow has ${triggerNodes.length} triggers. Only one trigger is allowed.`);
  }

  // Non-trigger nodes without incoming edge (excluding sticky notes)
  const functionalNodes = nodes.filter((n) => n.type !== "sticky_note" && n.data?.category !== "utility");
  functionalNodes.forEach((node) => {
    if (node.data?.category !== "trigger" && !node.type?.startsWith("trigger_")) {
      const hasIncoming = edges.some((e) => e.target === node.id);
      if (!hasIncoming) {
        errors.push(`Node "${node.data?.label || node.id}" has no incoming connection.`);
      }
    }
  });

  // Cycle check (DFS)
  const adj = {};
  nodes.forEach((n) => { adj[n.id] = []; });
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });

  const visited = {};
  const recStack = {};

  function isCyclic(v) {
    if (!visited[v]) {
      visited[v] = true;
      recStack[v] = true;
      for (const neighbor of adj[v] || []) {
        if (!visited[neighbor] && isCyclic(neighbor)) return true;
        if (recStack[neighbor]) return true;
      }
    }
    recStack[v] = false;
    return false;
  }

  for (const node of nodes) {
    if (isCyclic(node.id)) {
      errors.push("Workflow contains an invalid cycle/loop.");
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Pure execution function that traverses a workflow graph
 * and returns detailed per-node results.
 */
export function runWorkflow(workflow, triggerPayload = DEFAULT_TRIGGER_PAYLOAD, options = {}) {
  const { executeSideEffects = false, automationId = null } = options;
  const startTime = Date.now();
  const nodes = workflow?.nodes || [];
  const edges = workflow?.edges || [];

  const perNodeResults = {};
  const logs = [];
  let overallSuccess = true;
  let failureReason = null;

  // 1. Locate trigger node
  const triggerNode = nodes.find(
    (n) => n.data?.category === "trigger" || n.type?.startsWith("trigger_")
  );

  if (!triggerNode) {
    return {
      success: false,
      executionId: `exec_${Date.now()}`,
      duration: 12,
      error: "No trigger node found in workflow",
      perNodeResults: {},
      logs: ["Error: No trigger node present in workflow."],
      outputData: null,
    };
  }

  // State context carried down the execution pipeline
  let pipelineData = {
    ...triggerPayload,
    variables: {},
    appliedTags: [],
    dmsSent: [],
    commentsReplied: [],
    orderCreated: null,
  };

  // Queue of nodes to process: [ { nodeId, incomingData, sourceHandle } ]
  const queue = [{ nodeId: triggerNode.id, incomingData: [triggerPayload], sourceHandle: null }];
  const visitedNodeIds = new Set();

  while (queue.length > 0) {
    const { nodeId, incomingData, sourceHandle } = queue.shift();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.type === "sticky_note") continue;

    visitedNodeIds.add(nodeId);
    const nodeStartTime = Date.now();
    const isNodeDisabled = node.data?.disabled === true;

    // Default node outcome
    let nodeStatus = "success";
    let nodeOutput = incomingData;
    let nodeError = null;

    if (isNodeDisabled) {
      nodeStatus = "skipped";
      logs.push(`[${node.data?.label || nodeId}] Node is disabled. Passing data through.`);
    } else {
      try {
        const result = executeSingleNode(node, incomingData[0] || pipelineData, pipelineData, {
          executeSideEffects,
          automationId,
        });

        nodeOutput = Array.isArray(result.output) ? result.output : [result.output];
        pipelineData = { ...pipelineData, ...result.updatedContext };
        if (result.log) logs.push(result.log);
      } catch (err) {
        nodeStatus = "error";
        nodeError = err.message || "Execution error";
        overallSuccess = false;
        failureReason = `${node.data?.label || nodeId}: ${nodeError}`;
        logs.push(`[${node.data?.label || nodeId}] ERROR: ${nodeError}`);
      }
    }

    perNodeResults[nodeId] = {
      status: nodeStatus,
      inputItems: incomingData,
      outputItems: nodeOutput,
      duration: Math.max(15, Math.floor(Math.random() * 45) + (Date.now() - nodeStartTime)),
      error: nodeError,
      executedAt: new Date().toISOString(),
    };

    if (nodeStatus === "error") {
      // Stop downstream execution on hard failure
      break;
    }

    // Determine which downstream edges to follow
    const outgoingEdges = edges.filter((e) => e.source === nodeId);

    if (node.type === "logic_if" || node.data?.nodeType === "logic_if") {
      // IF condition decides whether to route through 'true' or 'false' handle
      const conditionPassed = pipelineData._lastIfResult === true;
      const targetBranch = conditionPassed ? "true" : "false";

      logs.push(`[${node.data?.label}] Condition evaluated to ${targetBranch.toUpperCase()}`);

      outgoingEdges
        .filter((e) => e.sourceHandle === targetBranch || (!e.sourceHandle && targetBranch === "true"))
        .forEach((edge) => {
          queue.push({
            nodeId: edge.target,
            incomingData: nodeOutput,
            sourceHandle: edge.sourceHandle,
          });
        });
    } else if (node.type === "logic_switch" || node.data?.nodeType === "logic_switch") {
      // Switch branches
      const chosenBranch = pipelineData._lastSwitchCase || "default";
      outgoingEdges
        .filter((e) => e.sourceHandle === chosenBranch)
        .forEach((edge) => {
          queue.push({
            nodeId: edge.target,
            incomingData: nodeOutput,
            sourceHandle: edge.sourceHandle,
          });
        });
    } else {
      // Normal flow: push all downstream connected targets
      outgoingEdges.forEach((edge) => {
        queue.push({
          nodeId: edge.target,
          incomingData: nodeOutput,
          sourceHandle: edge.sourceHandle,
        });
      });
    }
  }

  const totalDuration = Date.now() - startTime + Math.floor(Math.random() * 40 + 20);

  return {
    success: overallSuccess,
    executionId: `exec_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    status: overallSuccess ? "success" : "failed",
    duration: totalDuration,
    error: failureReason,
    startedAt: new Date(startTime).toISOString(),
    finishedAt: new Date().toISOString(),
    perNodeResults,
    logs,
    triggerPayload,
    outputData: pipelineData,
  };
}

/**
 * Execute logic for a single node
 */
function executeSingleNode(node, item, context, options) {
  const nodeType = node.data?.nodeType || node.type;
  const config = node.data?.config || {};
  const { executeSideEffects, automationId } = options;

  let output = { ...item };
  let updatedContext = {};
  let log = null;

  switch (nodeType) {
    // ------------------------------------
    // TRIGGERS
    // ------------------------------------
    case "trigger_reel_comment": {
      const keywords = Array.isArray(config.keywords)
        ? config.keywords
        : typeof config.keywords === "string"
        ? config.keywords.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
        : ["GOLD", "LINK"];
      const matchType = config.matchType || "contains";

      let comment = item.commentText || (keywords[0] || "BUY");

      let matchedResult = matchComment(comment, { triggerKeywords: keywords, matchType });
      // If simulated comment from default payload didn't match custom configured keyword, adapt to trigger's keyword
      if (!matchedResult.matched && keywords.length > 0) {
        comment = keywords[0];
        matchedResult = matchComment(comment, { triggerKeywords: keywords, matchType });
      }

      if (!matchedResult.matched) {
        throw new Error(`Comment "${comment}" did not match trigger keywords [${keywords.join(", ")}]`);
      }

      output = {
        ...item,
        triggerType: "reel_comment",
        matchedKeyword: comment.toUpperCase(),
        reelId: config.reelId || item.reelId,
      };
      log = `[Reel Comment Trigger] Matched keyword "${comment}" on reel ${output.reelId || "current"}`;
      break;
    }

    case "trigger_story_reply": {
      output = {
        ...item,
        triggerType: "story_reply",
        replyText: item.commentText || "Love this!",
      };
      log = `[Story Reply Trigger] Received story reply from ${item.username}`;
      break;
    }

    case "trigger_dm_keyword": {
      output = {
        ...item,
        triggerType: "dm_keyword",
        keyword: item.commentText || "PRICE",
      };
      log = `[DM Keyword Trigger] Received DM keyword "${output.keyword}"`;
      break;
    }

    case "trigger_story_mention": {
      output = {
        ...item,
        triggerType: "story_mention",
        mediaType: "story",
      };
      log = `[Story Mention Trigger] ${item.username} mentioned your account`;
      break;
    }

    case "trigger_new_follower": {
      output = {
        ...item,
        triggerType: "new_follower",
        followedAt: new Date().toISOString(),
      };
      log = `[New Follower Trigger] New follower ${item.username} joined`;
      break;
    }

    case "trigger_manual": {
      output = {
        ...item,
        triggerType: "manual_trigger",
        executedBy: "admin",
      };
      log = `[Manual Trigger] Started manual test execution`;
      break;
    }

    // ------------------------------------
    // INSTAGRAM ACTIONS
    // ------------------------------------
    case "action_send_dm": {
      const product = db.state.products.find((p) => p.id === (config.productId || item.productId)) || db.state.products[0];
      const targetUrl = config.buttonUrl || product?.productUrl || "https://urbanstyle.in";
      const rawMessage = config.messageText || "Hey {{username}}! Tap below to shop {{product_name}}: {{product_url}}";

      const renderedText = renderTemplate(rawMessage, {
        username: item.username || "@shopper",
        product_name: product?.name || "Featured Item",
        product_price: product ? formatINR(product.price) : "₹1,499",
        product_url: targetUrl,
      });

      output = {
        ...item,
        dmId: `msg_auto_${Date.now()}`,
        sentMessage: renderedText,
        buttonText: config.buttonText || "Shop Now",
        buttonUrl: targetUrl,
        quickReplies: config.quickReplies || ["Track Order", "More Colors"],
      };

      updatedContext = {
        dmsSent: [...(context.dmsSent || []), output.sentMessage],
      };

      log = `[Send Instagram DM] DM sent to ${item.username}: "${renderedText.slice(0, 40)}..."`;

      if (executeSideEffects) {
        performDmSideEffect(item, output, product, automationId);
      }
      break;
    }

    case "action_reply_comment": {
      const variations = config.replyVariations || [
        "Sent you a DM! Check your requests 📩✨",
        "Just sent the direct link to your inbox! 🛍️",
      ];
      const reply = variations[Math.floor(Math.random() * variations.length)];
      output = {
        ...item,
        commentReplyId: `reply_${Date.now()}`,
        publicReplyText: reply,
      };
      updatedContext = {
        commentsReplied: [...(context.commentsReplied || []), reply],
      };
      log = `[Reply to Comment] Public comment reply posted: "${reply}"`;
      break;
    }

    case "action_send_product": {
      const product = db.state.products.find((p) => p.id === (config.productId || item.productId)) || db.state.products[0];
      const trackedLink = `${product?.productUrl || "https://urbanstyle.in"}?utm_source=ig_bot&utm_medium=dm`;
      output = {
        ...item,
        product: {
          id: product?.id,
          name: product?.name,
          price: product?.price,
          url: trackedLink,
        },
      };
      log = `[Send Product Link] Attached tracked product link for "${product?.name}"`;
      break;
    }

    case "action_quick_replies": {
      output = {
        ...item,
        quickRepliesSent: config.quickReplies || ["Check Stock", "Size Guide", "Apply Coupon"],
      };
      log = `[Send Quick Replies] Sent ${output.quickRepliesSent.length} quick reply interactive pills`;
      break;
    }

    // ------------------------------------
    // CRM ACTIONS
    // ------------------------------------
    case "action_add_tag": {
      const tagIds = config.tagIds || ["tag_3"];
      output = {
        ...item,
        addedTags: tagIds,
      };
      updatedContext = {
        appliedTags: [...new Set([...(context.appliedTags || []), ...tagIds])],
      };
      log = `[Add Tag] Added ${tagIds.length} tag(s) to ${item.username}`;

      if (executeSideEffects) {
        const customer = findOrCreateCustomer(item);
        if (customer) {
          customer.tags = [...new Set([...(customer.tags || []), ...tagIds])];
          db.persist();
        }
      }
      break;
    }

    case "action_remove_tag": {
      const tagIds = config.tagIds || [];
      output = {
        ...item,
        removedTags: tagIds,
      };
      log = `[Remove Tag] Removed tags from ${item.username}`;
      break;
    }

    case "action_update_contact": {
      const key = config.fieldKey || "notes";
      const val = config.fieldValue || "Qualified Instagram Lead";
      output = {
        ...item,
        updatedField: { [key]: val },
      };
      log = `[Update Contact Field] Set "${key}" = "${val}" on ${item.username}`;
      break;
    }

    case "action_assign_team": {
      output = {
        ...item,
        assignedTo: config.assigneeName || "Customer Success Team",
      };
      log = `[Assign to Team Member] Assigned ${item.username} to ${output.assignedTo}`;
      break;
    }

    case "action_create_order": {
      output = {
        ...item,
        simulatedOrderId: `ord_sim_${Date.now()}`,
        status: "pending_payment",
      };
      log = `[Create Order] Draft simulated order generated for ${item.username}`;
      break;
    }

    // ------------------------------------
    // LOGIC & FLOW
    // ------------------------------------
    case "logic_if": {
      const leftVal = resolveVariable(config.leftVariable || "{{commentText}}", item, context);
      const operator = config.operator || "contains";
      const rightVal = config.rightValue || "GOLD";

      const conditionResult = evaluateIfCondition(leftVal, operator, rightVal);

      output = {
        ...item,
        conditionEvaluated: {
          left: leftVal,
          operator,
          right: rightVal,
          result: conditionResult,
        },
      };

      updatedContext = {
        _lastIfResult: conditionResult,
      };

      log = `[IF Node] Evaluated (${leftVal} ${operator} ${rightVal}) => ${conditionResult}`;
      break;
    }

    case "logic_switch": {
      const matchVal = resolveVariable(config.variable || "{{commentText}}", item, context);
      const cases = config.cases || [
        { id: "case_1", label: "VIP Customer", value: "VIP" },
        { id: "case_2", label: "Sale Inquiry", value: "SALE" },
      ];

      let chosenCase = "default";
      for (const c of cases) {
        if (String(matchVal).toLowerCase().includes(String(c.value).toLowerCase())) {
          chosenCase = c.id;
          break;
        }
      }

      output = {
        ...item,
        switchBranch: chosenCase,
      };
      updatedContext = {
        _lastSwitchCase: chosenCase,
      };
      log = `[Switch Node] Routed to branch "${chosenCase}" based on value "${matchVal}"`;
      break;
    }

    case "logic_wait": {
      const duration = config.duration || 5;
      const unit = config.unit || "minutes";
      output = {
        ...item,
        waitedDuration: `${duration} ${unit} (simulated)`,
      };
      log = `[Wait Node] Simulated delay of ${duration} ${unit}`;
      break;
    }

    case "logic_filter": {
      const val = resolveVariable(config.variable || "{{username}}", item, context);
      const passed = Boolean(val);
      output = { ...item, filterPassed: passed };
      log = `[Filter Node] Filter ${passed ? "passed" : "dropped"}`;
      break;
    }

    case "logic_merge": {
      output = { ...item, mergedAt: new Date().toISOString() };
      log = `[Merge Node] Merged upstream branches`;
      break;
    }

    case "logic_set_variable": {
      const varName = config.variableName || "leadScore";
      const varVal = config.variableValue || "100";
      output = {
        ...item,
        variables: { ...(item.variables || {}), [varName]: varVal },
      };
      updatedContext = {
        variables: { ...(context.variables || {}), [varName]: varVal },
      };
      log = `[Set Variable] Set variable ${varName} = "${varVal}"`;
      break;
    }

    default:
      output = { ...item };
      log = `[Node] Processed step ${node.data?.label || node.id}`;
      break;
  }

  return { output, updatedContext, log };
}

/**
 * Resolves a dynamic variable expression like {{username}}
 */
function resolveVariable(expression, item, context) {
  if (!expression || typeof expression !== "string") return expression;
  return expression.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return item[key] ?? context.variables?.[key] ?? "";
  });
}

/**
 * Helper to find or create customer in db.state.customers
 */
function findOrCreateCustomer(item) {
  const username = item.username || "@shopper";
  const cleanUsername = username.startsWith("@") ? username : `@${username}`;
  let customer = db.state.customers.find(
    (c) => c.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (!customer) {
    const cleanName = cleanUsername.replace(/^@/, "").replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    customer = {
      id: `cust_${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      instagramUserId: `ig_${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `${cleanUsername.replace(/[@._]/g, "")}@gmail.com`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      city: "Mumbai",
      status: "new",
      firstInteraction: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      tags: ["tag_3"],
      interestedProductIds: item.productId ? [item.productId] : [],
      totalMessages: 1,
      linksSent: 1,
      linksClicked: 0,
      ordersCount: 0,
      lifetimeSpend: 0,
      customFields: {
        notes: `Acquired via workflow execution (${item.commentText || "Direct"})`,
      },
    };
    db.state.customers.unshift(customer);
  } else {
    customer.lastInteraction = new Date().toISOString();
    customer.totalMessages = (customer.totalMessages || 0) + 1;
  }

  return customer;
}

/**
 * Execute DM side effect: append to Inbox, DM Activity, counters
 */
function performDmSideEffect(item, output, product, automationId) {
  const customer = findOrCreateCustomer(item);
  const now = new Date().toISOString();

  // 1. Append to Conversations (Inbox)
  let conv = db.state.conversations.find((c) => c.customerId === customer.id || c.username === customer.username);
  const botMessage = {
    id: `msg_bot_${Date.now()}`,
    sender: "bot",
    text: output.sentMessage,
    timestamp: now,
    button: {
      text: output.buttonText || "Shop Now",
      url: output.buttonUrl || product?.productUrl || "https://urbanstyle.in",
    },
    quickReplies: output.quickReplies || [],
  };

  if (!conv) {
    conv = {
      id: `conv_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      username: customer.username,
      avatar: getInitials(customer.name),
      status: "automated",
      lastMessage: output.sentMessage,
      lastMessageTimestamp: now,
      unreadCount: 0,
      messages: [botMessage],
    };
    db.state.conversations.unshift(conv);
  } else {
    conv.messages.push(botMessage);
    conv.lastMessage = output.sentMessage;
    conv.lastMessageTimestamp = now;
  }

  // 2. Add DM Activity item
  const activityItem = {
    id: `act_${Date.now()}`,
    customerId: customer.id,
    customerName: customer.name,
    username: customer.username,
    automationId: automationId || "auto_1",
    automationName: "Automated DM Flow",
    actionType: "dm_sent",
    status: "Delivered",
    timestamp: now,
    details: {
      messagePreview: output.sentMessage.slice(0, 75) + "...",
      productName: product?.name || "Product",
      linkUrl: output.buttonUrl,
    },
  };
  db.state.dmActivity.unshift(activityItem);

  // 3. Update automation stats
  if (automationId) {
    const auto = db.state.automations.find((a) => a.id === automationId);
    if (auto) {
      auto.executions = (auto.executions || 0) + 1;
      auto.messagesSent = (auto.messagesSent || 0) + 1;
      auto.lastUpdated = now;
    }
  }

  db.persist();
}

/**
 * Automatically migrate legacy automation records to n8n-style workflow graph
 */
export function migrateAutomationToWorkflow(automation) {
  if (automation.workflow && automation.workflow.nodes && automation.workflow.nodes.length > 0) {
    return automation.workflow;
  }

  const keyword = automation.triggerKeyword || "GOLD";
  const reelId = automation.reelId || "reel_1";
  const productId = automation.productId || "prod_2";
  const message = automation.messageTemplate || "Hey {{username}}! Tap below to shop {{product_name}}: {{product_url}}";

  const nodes = [
    {
      id: "node_trigger",
      type: "appNode",
      position: { x: 80, y: 180 },
      data: {
        nodeType: "trigger_reel_comment",
        category: "trigger",
        label: "Reel Comment",
        subtitle: `Keyword: ${keyword}`,
        config: {
          keywords: automation.triggerKeywords || [keyword],
          matchType: automation.matchType || "contains",
          reelId: reelId,
          replyToCommentPublicly: automation.publicReplyEnabled !== false,
          publicReplyText: "Sent you the private link in your DMs! 📩✨",
        },
      },
    },
    {
      id: "node_send_dm",
      type: "appNode",
      position: { x: 420, y: 180 },
      data: {
        nodeType: "action_send_dm",
        category: "action_instagram",
        label: "Send Instagram DM",
        subtitle: "Send tracked product link",
        config: {
          messageText: message,
          buttonText: "Shop Now",
          productId: productId,
          quickReplies: ["Size Guide", "Tarnish-Free?", "Shipping Time"],
        },
      },
    },
    {
      id: "node_add_tag",
      type: "appNode",
      position: { x: 760, y: 180 },
      data: {
        nodeType: "action_add_tag",
        category: "action_crm",
        label: "Add Tag",
        subtitle: "Add tag: Reel Lead",
        config: {
          tagIds: ["tag_3", "tag_12"],
        },
      },
    },
  ];

  const edges = [
    {
      id: "edge_trigger_dm",
      source: "node_trigger",
      target: "node_send_dm",
      type: "deletableEdge",
      animated: true,
    },
    {
      id: "edge_dm_tag",
      source: "node_send_dm",
      target: "node_add_tag",
      type: "deletableEdge",
      animated: true,
    },
  ];

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}

/**
 * Generate 15-20 realistic execution history runs for an automation
 */
export function generateSeedExecutions(automationId, count = 18) {
  const executions = [];
  const sampleUsers = [
    { username: "@priya_sharma_98", name: "Priya Sharma", kw: "GOLD" },
    { username: "@siddharth_v_fits", name: "Siddharth Verma", kw: "RUN" },
    { username: "@ananya_couture", name: "Ananya Roy", kw: "PRICE" },
    { username: "@rahul_mehta_99", name: "Rahul Mehta", kw: "LINK" },
    { username: "@sneha_curates", name: "Sneha Patel", kw: "BUY" },
    { username: "@kabir_streetwear", name: "Kabir Malhotra", kw: "GOLD" },
    { username: "@tanya_looks", name: "Tanya Kapoor", kw: "SHOP" },
    { username: "@aditya_kicks", name: "Aditya Sengupta", kw: "LINK" },
  ];

  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const user = sampleUsers[i % sampleUsers.length];
    const isFailure = i === 4 || i === 12; // A couple of realistic failures
    const timeOffset = (i * 45 + 15) * 60 * 1000;
    const startedAt = new Date(now - timeOffset).toISOString();
    const duration = isFailure ? 120 : Math.floor(450 + Math.random() * 320);

    executions.push({
      id: `exec_${automationId}_${1000 + i}`,
      automationId,
      status: isFailure ? "failed" : "success",
      startedAt,
      duration,
      triggerPayload: {
        username: user.username,
        customerName: user.name,
        commentText: user.kw,
        timestamp: startedAt,
      },
      error: isFailure
        ? i === 4
          ? "Instagram messaging window expired (>24 hours since last user interaction)"
          : "Product stock exhausted during checkout link reservation"
        : null,
      perNodeResults: {
        node_trigger: {
          status: "success",
          duration: 35,
          inputItems: [{ comment: user.kw, user: user.username }],
          outputItems: [{ matchedKeyword: user.kw, qualified: true }],
        },
        node_send_dm: {
          status: isFailure ? "error" : "success",
          duration: isFailure ? 85 : 180,
          inputItems: [{ matchedKeyword: user.kw }],
          outputItems: isFailure ? [] : [{ dmDelivered: true, messageId: `msg_${1000 + i}` }],
          error: isFailure ? "Instagram Graph API: (#10) Message recipient window closed" : null,
        },
        node_add_tag: {
          status: isFailure ? "skipped" : "success",
          duration: isFailure ? 0 : 42,
          inputItems: isFailure ? [] : [{ dmDelivered: true }],
          outputItems: isFailure ? [] : [{ tagsApplied: ["tag_3", "tag_12"] }],
        },
      },
      itemCount: isFailure ? 0 : 1,
    });
  }

  return executions;
}
