export const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUSES = {
  PAID: "paid",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const AUTOMATION_TRIGGERS = [
  { id: "reel_comment", label: "Reel Comment", description: "Triggered when user comments a keyword on a Reel" },
  { id: "story_reply", label: "Story Reply", description: "Triggered when user replies to an active Instagram Story" },
  { id: "dm_keyword", label: "Direct Message Keyword", description: "Triggered when user sends a specific keyword in DM" },
  { id: "live_comment", label: "Live Video Comment", description: "Triggered during Instagram Live broadcasts" },
  { id: "story_mention", label: "Story Mention", description: "Triggered when someone mentions your handle in their Story" },
];

export const WORKFLOW_NODES = [
  { id: "trigger", title: "Instagram Trigger", type: "trigger", icon: "Zap" },
  { id: "identify_contact", title: "Identify Contact", type: "action", icon: "UserCheck" },
  { id: "find_product", title: "Find Product", type: "action", icon: "ShoppingBag" },
  { id: "send_dm", title: "Send Instagram DM", type: "action", icon: "Send" },
  { id: "track_click", title: "Track Link Click", type: "action", icon: "MousePointerClick" },
  { id: "update_activity", title: "Update Contact Activity", type: "action", icon: "Activity" },
];

export const DENSITY_OPTIONS = [
  { id: "compact", label: "Compact", description: "Dense row padding for data-heavy views" },
  { id: "normal", label: "Normal", description: "Balanced spacing and typography" },
  { id: "comfortable", label: "Comfortable", description: "Generous whitespace for touch or relaxed viewing" },
];

export const CURRENCY_SYMBOL = "₹";
