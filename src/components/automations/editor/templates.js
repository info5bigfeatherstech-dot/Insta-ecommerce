/**
 * n8n-style Workflow Templates for Instagram Commerce
 */

export const WORKFLOW_TEMPLATES = [
  {
    id: "template_reel_product_dm",
    title: "Reel Comment to Product Link DM",
    description: "Detect comment keywords on a Reel, immediately send a direct message with a tracked product link, and tag the lead.",
    category: "Reels & Commerce",
    tags: ["Reel", "DM", "Product Link", "Best Seller"],
    badge: "Popular",
    workflow: {
      nodes: [
        {
          id: "node_1",
          type: "appNode",
          position: { x: 80, y: 160 },
          data: {
            nodeType: "trigger_reel_comment",
            category: "trigger",
            label: "Reel Comment",
            subtitle: "Keyword: 'BUY', 'LINK'",
            config: {
              keywords: ["BUY", "LINK", "PRICE"],
              matchType: "contains",
              reelId: "reel_1",
              replyToCommentPublicly: true,
              publicReplyText: "Sent the link to your DMs! Check requests 📩✨",
            },
          },
        },
        {
          id: "node_2",
          type: "appNode",
          position: { x: 420, y: 160 },
          data: {
            nodeType: "action_send_dm",
            category: "action_instagram",
            label: "Send Instagram DM",
            subtitle: "Product link + Discount",
            config: {
              messageText: "Hey {{username}}! ✨ Thanks for asking about {{product_name}}! Here is your private 15% discount link: {{product_url}}",
              buttonText: "Shop with 15% OFF",
              productId: "prod_2",
              quickReplies: ["Size Chart", "Return Policy", "Other Colors"],
            },
          },
        },
        {
          id: "node_3",
          type: "appNode",
          position: { x: 760, y: 160 },
          data: {
            nodeType: "action_add_tag",
            category: "action_crm",
            label: "Add Tag",
            subtitle: "Tags: Reel Lead, Product Link Sent",
            config: {
              tagIds: ["tag_3", "tag_12"],
            },
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "node_1",
          target: "node_2",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e2-3",
          source: "node_2",
          target: "node_3",
          type: "deletableEdge",
          animated: true,
        },
      ],
    },
  },
  {
    id: "template_keyword_dm_branch",
    title: "Keyword DM → IF Customer Exists → VIP Tag & Reply",
    description: "Inspect incoming DM keywords, branch using an IF condition to check whether the customer has ordered before, and send personalized responses.",
    category: "Customer Logic",
    tags: ["DM Keyword", "IF Condition", "Segmentation", "VIP"],
    badge: "Advanced",
    workflow: {
      nodes: [
        {
          id: "node_1",
          type: "appNode",
          position: { x: 80, y: 220 },
          data: {
            nodeType: "trigger_dm_keyword",
            category: "trigger",
            label: "DM Keyword",
            subtitle: "Keyword: 'VIP', 'SALE'",
            config: {
              keywords: ["VIP", "SALE", "DISCOUNT"],
              matchType: "contains",
            },
          },
        },
        {
          id: "node_2",
          type: "appNode",
          position: { x: 380, y: 220 },
          data: {
            nodeType: "logic_if",
            category: "logic",
            label: "IF Customer Exists",
            subtitle: "ordersCount > 0",
            config: {
              leftVariable: "{{ordersCount}}",
              operator: "greater_than",
              rightValue: "0",
            },
          },
        },
        {
          id: "node_3_true",
          type: "appNode",
          position: { x: 720, y: 100 },
          data: {
            nodeType: "action_send_dm",
            category: "action_instagram",
            label: "VIP Welcome Back DM",
            subtitle: "Exclusive VIP Perks",
            config: {
              messageText: "Welcome back, {{username}}! As a valued VIP member, you get priority shipping and 20% off all new arrivals: {{product_url}}",
              buttonText: "Access VIP Collection",
              productId: "prod_1",
            },
          },
        },
        {
          id: "node_3_false",
          type: "appNode",
          position: { x: 720, y: 340 },
          data: {
            nodeType: "action_send_dm",
            category: "action_instagram",
            label: "First-Timer DM",
            subtitle: "Welcome Offer",
            config: {
              messageText: "Hey {{username}}! Welcome to UrbanStyle! Use coupon code FIRST10 for ₹500 off your very first order: {{product_url}}",
              buttonText: "Shop New Arrivals",
              productId: "prod_2",
            },
          },
        },
        {
          id: "node_4",
          type: "appNode",
          position: { x: 1060, y: 100 },
          data: {
            nodeType: "action_add_tag",
            category: "action_crm",
            label: "Add Tag: VIP Customer",
            subtitle: "Tag: VIP",
            config: {
              tagIds: ["tag_1"],
            },
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "node_1",
          target: "node_2",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e2-3t",
          source: "node_2",
          sourceHandle: "true",
          target: "node_3_true",
          type: "deletableEdge",
          animated: true,
          label: "True (Has Orders)",
        },
        {
          id: "e2-3f",
          source: "node_2",
          sourceHandle: "false",
          target: "node_3_false",
          type: "deletableEdge",
          animated: true,
          label: "False (New Contact)",
        },
        {
          id: "e3t-4",
          source: "node_3_true",
          target: "node_4",
          type: "deletableEdge",
          animated: true,
        },
      ],
    },
  },
  {
    id: "template_story_quick_replies",
    title: "Story Reply → Quick Replies → Product Link",
    description: "When someone replies to your Instagram Story, prompt them with interactive quick-reply pills before sending the direct catalog item.",
    category: "Story Engagement",
    tags: ["Story Reply", "Interactive", "Quick Replies"],
    badge: "High Engagement",
    workflow: {
      nodes: [
        {
          id: "node_1",
          type: "appNode",
          position: { x: 80, y: 180 },
          data: {
            nodeType: "trigger_story_reply",
            category: "trigger",
            label: "Story Reply Trigger",
            subtitle: "Any reply to current story",
            config: {
              keywords: ["LOOK", "PRICE", "OUTFIT"],
              matchType: "contains",
            },
          },
        },
        {
          id: "node_2",
          type: "appNode",
          position: { x: 420, y: 180 },
          data: {
            nodeType: "action_quick_replies",
            category: "action_instagram",
            label: "Send Quick Replies",
            subtitle: "3 interactive option buttons",
            config: {
              promptMessage: "Hey {{username}}! Thanks for replying to our story! What would you like to explore?",
              quickReplies: ["Top & Bottom Set", "Sneakers & Kicks", "View Sale"],
            },
          },
        },
        {
          id: "node_3",
          type: "appNode",
          position: { x: 760, y: 180 },
          data: {
            nodeType: "action_send_product",
            category: "action_instagram",
            label: "Send Product Link",
            subtitle: "Heavyweight Cotton Hoodie",
            config: {
              productId: "prod_1",
              customMessage: "Here is the exact piece from today's story: {{product_url}}",
            },
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "node_1",
          target: "node_2",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e2-3",
          source: "node_2",
          target: "node_3",
          type: "deletableEdge",
          animated: true,
        },
      ],
    },
  },
  {
    id: "template_link_wait_followup",
    title: "Link Sent → Wait → Follow-Up If Not Clicked",
    description: "Send initial product link, wait 2 hours, and automatically send a polite nudge with a limited-time free delivery voucher.",
    category: "Conversion Recovery",
    tags: ["Wait / Delay", "Nudge", "Follow-up", "Coupon"],
    badge: "Recovery",
    workflow: {
      nodes: [
        {
          id: "node_1",
          type: "appNode",
          position: { x: 80, y: 180 },
          data: {
            nodeType: "trigger_reel_comment",
            category: "trigger",
            label: "Reel Comment",
            subtitle: "Keyword: 'SIZE', 'FIT'",
            config: {
              keywords: ["SIZE", "FIT"],
              matchType: "contains",
              reelId: "reel_2",
            },
          },
        },
        {
          id: "node_2",
          type: "appNode",
          position: { x: 400, y: 180 },
          data: {
            nodeType: "action_send_dm",
            category: "action_instagram",
            label: "Send Sizing Guide & Link",
            subtitle: "Includes size chart",
            config: {
              messageText: "Hey {{username}}! Here is the size guide for {{product_name}}: {{product_url}}",
              buttonText: "Check My Size",
              productId: "prod_3",
            },
          },
        },
        {
          id: "node_3",
          type: "appNode",
          position: { x: 740, y: 180 },
          data: {
            nodeType: "logic_wait",
            category: "logic",
            label: "Wait 2 Hours",
            subtitle: "Duration: 2 hours",
            config: {
              duration: 2,
              unit: "hours",
            },
          },
        },
        {
          id: "node_4",
          type: "appNode",
          position: { x: 1060, y: 180 },
          data: {
            nodeType: "action_send_dm",
            category: "action_instagram",
            label: "Follow-Up Free Shipping",
            subtitle: "Coupon code FREESHIP",
            config: {
              messageText: "Hey {{username}}, still looking at {{product_name}}? Complete your order within 6 hours and get FREE express delivery with code FREESHIP! 🚚✨",
              buttonText: "Claim Free Shipping",
              productId: "prod_3",
            },
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "node_1",
          target: "node_2",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e2-3",
          source: "node_2",
          target: "node_3",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e3-4",
          source: "node_3",
          target: "node_4",
          type: "deletableEdge",
          animated: true,
        },
      ],
    },
  },
  {
    id: "template_abandoned_interest",
    title: "Abandoned Interest Follow-up & Cart Recovery",
    description: "Identify high-intent shoppers who requested product details but haven't placed an order within 24 hours, alerting customer support.",
    category: "Sales Assist",
    tags: ["High Intent", "Team Assignment", "VIP Lead"],
    badge: "CRM",
    workflow: {
      nodes: [
        {
          id: "node_1",
          type: "appNode",
          position: { x: 80, y: 180 },
          data: {
            nodeType: "trigger_dm_keyword",
            category: "trigger",
            label: "High-Intent Inquiry",
            subtitle: "Keywords: 'ORDER', 'CUSTOM'",
            config: {
              keywords: ["ORDER", "CUSTOM", "BULK"],
              matchType: "contains",
            },
          },
        },
        {
          id: "node_2",
          type: "appNode",
          position: { x: 400, y: 180 },
          data: {
            nodeType: "action_add_tag",
            category: "action_crm",
            label: "Tag: High-Intent Lead",
            subtitle: "Add tag: High Intent",
            config: {
              tagIds: ["tag_3", "tag_11"],
            },
          },
        },
        {
          id: "node_3",
          type: "appNode",
          position: { x: 720, y: 180 },
          data: {
            nodeType: "action_assign_team",
            category: "action_crm",
            label: "Assign to Concierge",
            subtitle: "Assign: Personal Shopper Team",
            config: {
              assigneeName: "VIP Concierge Team",
            },
          },
        },
        {
          id: "node_4",
          type: "appNode",
          position: { x: 1040, y: 180 },
          data: {
            nodeType: "action_send_dm",
            category: "action_instagram",
            label: "Personal Concierge DM",
            subtitle: "Direct live styling support",
            config: {
              messageText: "Hi {{username}}! One of our stylists has been assigned to help you with your order. Feel free to ask any sizing or pairing questions here!",
              buttonText: "Chat with Stylist",
            },
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "node_1",
          target: "node_2",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e2-3",
          source: "node_2",
          target: "node_3",
          type: "deletableEdge",
          animated: true,
        },
        {
          id: "e3-4",
          source: "node_3",
          target: "node_4",
          type: "deletableEdge",
          animated: true,
        },
      ],
    },
  },
];
