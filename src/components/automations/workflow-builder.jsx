"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WORKFLOW_NODES } from "@/lib/constants";
import { WorkflowNode } from "./workflow-node";
import { NodeConfigPanel } from "./node-config-panel";
import { MessagePreview } from "./message-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/data/db";
import { Save, ArrowLeft, Zap, Smartphone, SlidersHorizontal, Info } from "lucide-react";
import { toast } from "sonner";

export function WorkflowBuilder({
  initialAutomation = null,
  onSave,
  isSaving = false,
}) {
  const router = useRouter();

  // Selected workflow node
  const [activeNodeId, setActiveNodeId] = React.useState("trigger");

  // Form state
  const [name, setName] = React.useState(initialAutomation?.name || "New DM Keyword Flow");
  const [status, setStatus] = React.useState(initialAutomation?.status || "active");
  const [triggerType, setTriggerType] = React.useState(initialAutomation?.triggerType || "reel_comment");
  const [triggerKeyword, setTriggerKeyword] = React.useState(initialAutomation?.triggerKeyword || "GOLD");
  const [reelId, setReelId] = React.useState(initialAutomation?.reelId || null);
  const [productId, setProductId] = React.useState(initialAutomation?.productId || db.state.products[0]?.id);
  const [discountCode, setDiscountCode] = React.useState(
    initialAutomation?.workflowConfig?.find_product?.discountCode || "VIP15"
  );
  const [checkStock, setCheckStock] = React.useState(true);
  const [messageTemplate, setMessageTemplate] = React.useState(
    initialAutomation?.messageTemplate ||
      "Hey {{username}}! ✨ Thank you for loving our {{product_name}}. We've unlocked an exclusive discount for you! Tap below to shop before stock runs out: {{product_url}}"
  );
  const [buttonText, setButtonText] = React.useState(
    initialAutomation?.workflowConfig?.send_dm?.buttonText || "Shop at 15% OFF"
  );
  const [quickReplies, setQuickReplies] = React.useState(
    initialAutomation?.workflowConfig?.send_dm?.quickReplies || [
      "Is it tarnish-free?",
      "Delivery time",
      "Return policy",
    ]
  );
  const [utmCampaign, setUtmCampaign] = React.useState(
    initialAutomation?.workflowConfig?.track_click?.utmCampaign || "instagram_automation"
  );
  const [assignedTags, setAssignedTags] = React.useState(
    initialAutomation?.workflowConfig?.update_activity?.addTags || ["tag_3"]
  );
  const [replyToCommentPublicly, setReplyToCommentPublicly] = React.useState(true);

  const selectedProduct = db.state.products.find((p) => p.id === productId) || db.state.products[0];

  const handleFieldChange = (field, value) => {
    switch (field) {
      case "triggerType":
        setTriggerType(value);
        break;
      case "triggerKeyword":
        setTriggerKeyword(value);
        break;
      case "reelId":
        setReelId(value);
        break;
      case "productId":
        setProductId(value);
        break;
      case "discountCode":
        setDiscountCode(value);
        break;
      case "checkStock":
        setCheckStock(value);
        break;
      case "messageTemplate":
        setMessageTemplate(value);
        break;
      case "buttonText":
        setButtonText(value);
        break;
      case "quickReplies":
        setQuickReplies(value);
        break;
      case "utmCampaign":
        setUtmCampaign(value);
        break;
      case "assignedTags":
        setAssignedTags(value);
        break;
      case "replyToCommentPublicly":
        setReplyToCommentPublicly(value);
        break;
      default:
        break;
    }
  };

  const getNodeSummary = (nodeId) => {
    switch (nodeId) {
      case "trigger":
        return `Keyword: "${triggerKeyword}" on ${triggerType.replace("_", " ")}`;
      case "identify_contact":
        return "Capture Instagram Profile & Customer ID";
      case "find_product":
        return `Attach: ${selectedProduct?.name?.slice(0, 24)}...`;
      case "send_dm":
        return `Button: "${buttonText}" + ${quickReplies.length} quick replies`;
      case "track_click":
        return `UTM Campaign: "${utmCampaign}"`;
      case "update_activity":
        return `Add ${assignedTags.length} CRM Tag(s)`;
      default:
        return "";
    }
  };

  const handleSaveFlow = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the automation");
      return;
    }

    const payload = {
      name,
      triggerType,
      triggerKeyword,
      reelId,
      productId,
      status,
      messageTemplate,
      workflowConfig: {
        trigger: {
          keyword: triggerKeyword,
          replyToCommentPublicly,
          publicCommentReply: "Check your DMs for the secret link! 📩✨",
        },
        identify_contact: {
          captureAvatar: true,
          autoCreateCustomer: true,
        },
        find_product: {
          productId,
          discountCode,
          checkStock,
        },
        send_dm: {
          message: messageTemplate,
          buttonText,
          quickReplies,
        },
        track_click: {
          utmCampaign,
          utmMedium: "instagram_dm",
        },
        update_activity: {
          addTags: assignedTags,
          updateJourney: `Triggered ${name}`,
        },
      },
    };

    await onSave(payload);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/automations")}
            className="h-8 w-8 text-[#64748B]"
            title="Back to Automations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 font-bold text-sm max-w-sm border-transparent hover:border-[#E2E8F0] focus:border-[#635BDB]"
                placeholder="Automation Name"
              />
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[10px] text-[#64748B] pl-2">
              Visual Workflow Engine • 6 Nodes Configured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/automations")}
            className="text-xs"
          >
            Discard
          </Button>
          <Button
            size="sm"
            onClick={handleSaveFlow}
            disabled={isSaving}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Workflow"}</span>
          </Button>
        </div>
      </div>

      {/* 3-Column Architecture: Flowchart Canvas, Node Config Panel, Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Node Flowchart */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Workflow Sequence
            </h3>
            <span className="text-[11px] text-[#635BDB] font-medium">Click step to edit</span>
          </div>

          <div className="flex flex-col items-center py-2">
            {WORKFLOW_NODES.map((node, index) => (
              <WorkflowNode
                key={node.id}
                node={node}
                index={index}
                totalNodes={WORKFLOW_NODES.length}
                isSelected={activeNodeId === node.id}
                onSelect={(id) => setActiveNodeId(id)}
                summary={getNodeSummary(node.id)}
              />
            ))}
          </div>
        </div>

        {/* Center Column (4 Cols): Active Node Configuration Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Step Settings</span>
          </div>

          <NodeConfigPanel
            activeNodeId={activeNodeId}
            formData={{
              triggerType,
              triggerKeyword,
              reelId,
              productId,
              discountCode,
              checkStock,
              messageTemplate,
              buttonText,
              quickReplies,
              utmCampaign,
              assignedTags,
              replyToCommentPublicly,
            }}
            onChange={handleFieldChange}
          />
        </div>

        {/* Right Column (4 Cols): Live Smartphone DM Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Live Instagram DM Preview</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              Real-time
            </span>
          </div>

          <MessagePreview
            message={messageTemplate}
            product={selectedProduct}
            buttonText={buttonText}
            quickReplies={quickReplies}
            triggerKeyword={triggerKeyword}
          />
        </div>
      </div>
    </div>
  );
}
