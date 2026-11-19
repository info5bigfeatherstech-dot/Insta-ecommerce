import {
  MessageSquare,
  Film,
  Sparkles,
  Zap,
  Tag,
  UserCheck,
  Split,
  Clock,
  Filter,
  Layers,
  ShoppingBag,
  Send,
  MessageCircle,
  HelpCircle,
  UserPlus,
  Play,
  FileText,
  Sliders,
  DollarSign,
  Share2,
} from "lucide-react";

export const NODE_CATEGORIES = [
  { id: "all", label: "All Nodes" },
  { id: "trigger", label: "Triggers", color: "#10B981" },
  { id: "action_instagram", label: "Instagram Actions", color: "#635BDB" },
  { id: "action_crm", label: "CRM & Sales", color: "#3B82F6" },
  { id: "logic", label: "Logic & Flow", color: "#F59E0B" },
  { id: "utility", label: "Utility", color: "#64748B" },
];

export const NODE_CATALOG = [
  // ------------------------------------
  // TRIGGERS (Green accent, no input handle)
  // ------------------------------------
  {
    type: "trigger_reel_comment",
    category: "trigger",
    label: "Reel Comment",
    icon: Film,
    accentColor: "#10B981",
    description: "Triggers when a user comments on an Instagram Reel with specific keywords.",
    defaultConfig: {
      keywords: ["BUY", "LINK"],
      matchType: "contains", // contains, exact, starts_with
      reelId: "reel_1",
      replyToCommentPublicly: true,
      publicReplyText: "Sent you the private link in your DMs! Check requests 📩✨",
    },
    defaultSubtitle: "Keyword: 'BUY', 'LINK'",
  },
  {
    type: "trigger_story_reply",
    category: "trigger",
    label: "Story Reply",
    icon: MessageCircle,
    accentColor: "#10B981",
    description: "Triggers when a customer replies directly to an active Instagram Story.",
    defaultConfig: {
      keywords: ["PRICE", "LINK", "SIZE"],
      matchType: "contains",
    },
    defaultSubtitle: "Reply with keywords",
  },
  {
    type: "trigger_dm_keyword",
    category: "trigger",
    label: "DM Keyword",
    icon: MessageSquare,
    accentColor: "#10B981",
    description: "Triggers when a user sends a direct message containing specific keywords.",
    defaultConfig: {
      keywords: ["ORDER", "HELP", "COUPON"],
      matchType: "contains",
    },
    defaultSubtitle: "Keywords in Direct Message",
  },
  {
    type: "trigger_story_mention",
    category: "trigger",
    label: "Story Mention",
    icon: Sparkles,
    accentColor: "#10B981",
    description: "Triggers when an Instagram user tags your store handle in their Story.",
    defaultConfig: {
      mentionType: "any",
    },
    defaultSubtitle: "When mentioned in Story",
  },
  {
    type: "trigger_new_follower",
    category: "trigger",
    label: "New Follower",
    icon: UserPlus,
    accentColor: "#10B981",
    description: "Triggers automatically when someone follows your Instagram Business profile.",
    defaultConfig: {
      welcomeDelay: 0,
    },
    defaultSubtitle: "Welcome new followers",
  },
  {
    type: "trigger_manual",
    category: "trigger",
    label: "Manual Trigger",
    icon: Play,
    accentColor: "#10B981",
    description: "Run workflow on demand for testing with custom trigger payload.",
    defaultConfig: {
      sampleUser: "@priya_sharma_98",
    },
    defaultSubtitle: "Manual test run",
  },

  // ------------------------------------
  // INSTAGRAM ACTIONS (Purple / Indigo)
  // ------------------------------------
  {
    type: "action_send_dm",
    category: "action_instagram",
    label: "Send Instagram DM",
    icon: Send,
    accentColor: "#635BDB",
    description: "Send an automated Instagram direct message with interactive CTA button and links.",
    defaultConfig: {
      messageText: "Hey {{username}}! ✨ Thanks for asking about {{product_name}}! Here is your exclusive 15% discount link: {{product_url}}",
      buttonText: "Shop with 15% OFF",
      productId: "prod_2",
      quickReplies: ["Size Chart", "Return Policy", "Tarnish-Free?"],
    },
    defaultSubtitle: "Send DM with tracked link",
  },
  {
    type: "action_reply_comment",
    category: "action_instagram",
    label: "Reply to Comment",
    icon: MessageSquare,
    accentColor: "#635BDB",
    description: "Post an automated public reply to the customer's comment with randomized variations.",
    defaultConfig: {
      replyVariations: [
        "Sent you a DM! Check your requests 📩✨",
        "Just sent the direct link to your inbox! 🛍️",
        "Check your DMs! Your private code is waiting 🔥",
      ],
    },
    defaultSubtitle: "Public comment reply",
  },
  {
    type: "action_send_product",
    category: "action_instagram",
    label: "Send Product Link",
    icon: ShoppingBag,
    accentColor: "#635BDB",
    description: "Attach a specific store product card with pricing and dynamic UTM tracking parameters.",
    defaultConfig: {
      productId: "prod_1",
      customMessage: "Take a look at {{product_name}} priced at {{product_price}}: {{product_url}}",
      includeDiscountCode: true,
      discountCode: "INSTA15",
    },
    defaultSubtitle: "Product card link",
  },
  {
    type: "action_quick_replies",
    category: "action_instagram",
    label: "Send Quick Replies",
    icon: Sliders,
    accentColor: "#635BDB",
    description: "Deliver interactive tap-to-reply button options inside Instagram direct messages.",
    defaultConfig: {
      promptMessage: "Choose an option below to proceed:",
      quickReplies: ["Track My Order", "Speak to Stylist", "Browse New In"],
    },
    defaultSubtitle: "Interactive option buttons",
  },

  // ------------------------------------
  // CRM ACTIONS (Blue)
  // ------------------------------------
  {
    type: "action_add_tag",
    category: "action_crm",
    label: "Add Tag",
    icon: Tag,
    accentColor: "#3B82F6",
    description: "Attach CRM tags to the customer's profile for segmentation and audience filtering.",
    defaultConfig: {
      tagIds: ["tag_3"],
    },
    defaultSubtitle: "Attach CRM tags",
  },
  {
    type: "action_remove_tag",
    category: "action_crm",
    label: "Remove Tag",
    icon: Tag,
    accentColor: "#3B82F6",
    description: "Remove one or more existing tags from the customer contact profile.",
    defaultConfig: {
      tagIds: [],
    },
    defaultSubtitle: "Remove customer tags",
  },
  {
    type: "action_update_contact",
    category: "action_crm",
    label: "Update Contact Field",
    icon: UserCheck,
    accentColor: "#3B82F6",
    description: "Save custom metadata or attributes to the customer CRM record.",
    defaultConfig: {
      fieldKey: "notes",
      fieldValue: "Qualified Instagram Shopper",
    },
    defaultSubtitle: "Update CRM custom field",
  },
  {
    type: "action_assign_team",
    category: "action_crm",
    label: "Assign to Team Member",
    icon: UserPlus,
    accentColor: "#3B82F6",
    description: "Route the customer conversation to a specific human agent or support queue.",
    defaultConfig: {
      assigneeName: "VIP Concierge Team",
    },
    defaultSubtitle: "Assign customer to agent",
  },
  {
    type: "action_create_order",
    category: "action_crm",
    label: "Create Order (Simulated)",
    icon: DollarSign,
    accentColor: "#3B82F6",
    description: "Generate a pending simulated order directly from DM checkout intent.",
    defaultConfig: {
      productId: "prod_2",
      quantity: 1,
    },
    defaultSubtitle: "Create draft store order",
  },

  // ------------------------------------
  // LOGIC & FLOW (Amber / Orange)
  // ------------------------------------
  {
    type: "logic_if",
    category: "logic",
    label: "IF Condition",
    icon: Split,
    accentColor: "#F59E0B",
    description: "Branch the workflow into True and False outputs based on conditional rules.",
    defaultConfig: {
      leftVariable: "{{commentText}}",
      operator: "contains", // equals, not_equals, contains, greater_than, is_empty
      rightValue: "BUY",
    },
    defaultSubtitle: "Branch: True / False",
  },
  {
    type: "logic_switch",
    category: "logic",
    label: "Switch",
    icon: Layers,
    accentColor: "#F59E0B",
    description: "Route into multiple possible paths based on matching criteria or keywords.",
    defaultConfig: {
      variable: "{{commentText}}",
      cases: [
        { id: "case_1", label: "VIP Customer", value: "VIP" },
        { id: "case_2", label: "Sale Inquiry", value: "SALE" },
      ],
    },
    defaultSubtitle: "Multi-branch switch",
  },
  {
    type: "logic_wait",
    category: "logic",
    label: "Wait",
    icon: Clock,
    accentColor: "#F59E0B",
    description: "Delay subsequent steps by a simulated period (e.g. 15 minutes, 2 hours, 1 day).",
    defaultConfig: {
      duration: 15,
      unit: "minutes",
    },
    defaultSubtitle: "Simulated delay",
  },
  {
    type: "logic_filter",
    category: "logic",
    label: "Filter",
    icon: Filter,
    accentColor: "#F59E0B",
    description: "Filter out incoming executions that do not meet specific criteria.",
    defaultConfig: {
      variable: "{{username}}",
      operator: "is_not_empty",
    },
    defaultSubtitle: "Filter execution items",
  },
  {
    type: "logic_merge",
    category: "logic",
    label: "Merge",
    icon: Share2,
    accentColor: "#F59E0B",
    description: "Combine multiple upstream execution branches back into a single path.",
    defaultConfig: {
      mode: "append",
    },
    defaultSubtitle: "Merge execution branches",
  },
  {
    type: "logic_set_variable",
    category: "logic",
    label: "Set Variable",
    icon: Sliders,
    accentColor: "#F59E0B",
    description: "Assign or modify workflow variables to use in downstream message templates.",
    defaultConfig: {
      variableName: "leadQuality",
      variableValue: "high",
    },
    defaultSubtitle: "Set workflow variable",
  },

  // ------------------------------------
  // UTILITY (Sticky note)
  // ------------------------------------
  {
    type: "sticky_note",
    category: "utility",
    label: "Sticky Note",
    icon: FileText,
    accentColor: "#64748B",
    description: "Add a resizable colored documentation card to organize your canvas.",
    defaultConfig: {
      text: "Notes for this automation section...",
      color: "amber", // amber, blue, green, purple, rose, gray
    },
    defaultSubtitle: "Canvas annotation",
  },
];

export function getNodeDefinition(type) {
  return NODE_CATALOG.find((n) => n.type === type) || NODE_CATALOG[0];
}
