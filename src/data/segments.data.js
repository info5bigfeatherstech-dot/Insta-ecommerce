export const initialSegments = [
  {
    id: "seg_1",
    name: "All Instagram Contacts",
    description: "Every contact captured across all Instagram touchpoints",
    color: "#635BDB",
    icon: "Users",
    conditions: [
      { field: "status", operator: "not_equals", value: "deleted" },
    ],
  },
  {
    id: "seg_2",
    name: "New Leads",
    description: "Contacts captured in the last 14 days with status 'new'",
    color: "#3B82F6",
    icon: "UserPlus",
    conditions: [
      { field: "status", operator: "equals", value: "new" },
    ],
  },
  {
    id: "seg_3",
    name: "Link Sent but Not Clicked",
    description: "Sent automated product checkout link but zero recorded clicks",
    color: "#F59E0B",
    icon: "MousePointerClick",
    conditions: [
      { field: "linksSent", operator: "greater_than", value: 0 },
      { field: "linksClicked", operator: "equals", value: 0 },
    ],
  },
  {
    id: "seg_4",
    name: "Interested in Footwear",
    description: "Contacts who engaged with sneaker or boot Reels and products",
    color: "#10B981",
    icon: "Footprints",
    conditions: [
      { field: "tags", operator: "contains", value: "tag_3" },
    ],
  },
  {
    id: "seg_5",
    name: "Customers Who Purchased",
    description: "Contacts with at least one successfully placed order",
    color: "#059669",
    icon: "ShoppingBag",
    conditions: [
      { field: "ordersCount", operator: "greater_than", value: 0 },
    ],
  },
  {
    id: "seg_6",
    name: "Inactive Contacts",
    description: "Contacts with no engagement or responses in over 45 days",
    color: "#64748B",
    icon: "UserX",
    conditions: [
      { field: "status", operator: "equals", value: "inactive" },
    ],
  },
  {
    id: "seg_7",
    name: "High Intent DM Shoppers",
    description: "Contacts tagged as High Intent or DM Inquirer",
    color: "#8B5CF6",
    icon: "Zap",
    conditions: [
      { field: "tags", operator: "contains", value: "tag_5" },
    ],
  },
  {
    id: "seg_8",
    name: "Repeat VIP Customers",
    description: "VIP tagged customers with 2 or more completed orders",
    color: "#EC4899",
    icon: "Crown",
    conditions: [
      { field: "tags", operator: "contains", value: "tag_1" },
      { field: "ordersCount", operator: "greater_than", value: 1 },
    ],
  },
];
