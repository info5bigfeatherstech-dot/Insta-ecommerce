"use client";

import * as React from "react";
import { useReactFlow } from "@xyflow/react";
import { getNodeDefinition } from "./node-catalog";
import { DEFAULT_TRIGGER_PAYLOAD, runWorkflow } from "@/lib/workflow-engine";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { MessagePreview } from "@/components/automations/message-preview";
import { db } from "@/data/db";
import { cn, formatINR } from "@/lib/utils";
import {
  X,
  Play,
  Settings,
  Code,
  Table as TableIcon,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Clock,
  Send,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export function NodeSettingsDialog() {
  const settingsNodeId = useWorkflowEditorStore((s) => s.settingsNodeId);
  const isSettingsOpen = useWorkflowEditorStore((s) => s.isSettingsOpen);
  const closeSettings = useWorkflowEditorStore((s) => s.closeSettings);
  const setIsDirty = useWorkflowEditorStore((s) => s.setIsDirty);
  const setExecutionResults = useWorkflowEditorStore((s) => s.setExecutionResults);
  const nodeExecResult = useWorkflowEditorStore((s) =>
    s.settingsNodeId ? s.executionResults[s.settingsNodeId] : null
  );
  const { getNode, setNodes, getNodes, getEdges } = useReactFlow();

  const [activeTab, setActiveTab] = React.useState("parameters"); // parameters, settings
  const [leftViewMode, setLeftViewMode] = React.useState("json"); // json, table
  const [rightViewMode, setRightViewMode] = React.useState("json"); // json, table
  const [isTestingStep, setIsTestingStep] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);

  // Form local state
  const [nodeLabel, setNodeLabel] = React.useState("");
  const [nodeSubtitle, setNodeSubtitle] = React.useState("");
  const [nodeDisabled, setNodeDisabled] = React.useState(false);
  const [nodeNotes, setNodeNotes] = React.useState("");
  const [retryOnFail, setRetryOnFail] = React.useState(false);
  const [config, setConfig] = React.useState({});

  const messageInputRef = React.useRef(null);

  const currentNode = settingsNodeId ? getNode(settingsNodeId) : null;
  const nodeType = currentNode?.data?.nodeType || "action_send_dm";
  const def = getNodeDefinition(nodeType);

  // Initialize form from node data
  React.useEffect(() => {
    if (currentNode) {
      setNodeLabel(currentNode.data?.label || def.label);
      setNodeSubtitle(currentNode.data?.subtitle || def.defaultSubtitle);
      setNodeDisabled(currentNode.data?.disabled === true);
      setNodeNotes(currentNode.data?.notes || "");
      setRetryOnFail(currentNode.data?.retryOnFail === true);
      setConfig(JSON.parse(JSON.stringify(currentNode.data?.config || def.defaultConfig || {})));

      // Preload test results if previously recorded
      if (nodeExecResult) {
        setTestResult(nodeExecResult);
      } else {
        setTestResult(null);
      }
    }
  }, [settingsNodeId, currentNode?.id, nodeExecResult]);

  // Available reels, products, tags from mock DB (called at top level to obey Rules of Hooks)
  const availableReels = React.useMemo(() => db.state.reels || [], []);
  const availableProducts = React.useMemo(() => db.state.products || [], []);
  const availableTags = React.useMemo(() => db.state.tags || [], []);

  if (!isSettingsOpen || !currentNode) return null;

  const triggerKeyword = Array.isArray(config.keywords)
    ? config.keywords[0]
    : typeof config.keywords === "string"
    ? config.keywords.split(",")[0]?.trim()
    : "BUY";

  // Upstream sample input data
  const baseInput = nodeExecResult?.inputItems?.[0] || DEFAULT_TRIGGER_PAYLOAD;
  const sampleInput = {
    ...baseInput,
    commentText:
      nodeType === "trigger_reel_comment"
        ? (triggerKeyword || "BUY")
        : (baseInput.commentText || triggerKeyword || "BUY"),
  };

  // Expression variables for insertion
  const VARIABLE_CHIPS = [
    { label: "username", expr: "{{username}}" },
    { label: "product_name", expr: "{{product_name}}" },
    { label: "product_price", expr: "{{product_price}}" },
    { label: "product_url", expr: "{{product_url}}" },
    { label: "comment_text", expr: "{{comment_text}}" },
  ];

  // Insert variable expression at cursor in message template textarea
  const handleInsertVariable = (expr) => {
    const currentVal = config.messageText || "";
    const textarea = messageInputRef.current;
    if (textarea) {
      const start = textarea.selectionStart || currentVal.length;
      const end = textarea.selectionEnd || currentVal.length;
      const updated = currentVal.substring(0, start) + expr + currentVal.substring(end);
      handleConfigChange("messageText", updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + expr.length, start + expr.length);
      }, 50);
    } else {
      handleConfigChange("messageText", currentVal + " " + expr);
    }
  };

  const handleConfigChange = (key, val) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  // Save changes to React Flow node
  const handleSave = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === settingsNodeId) {
          // Dynamic subtitle based on config
          let autoSubtitle = nodeSubtitle;
          if (nodeType === "trigger_reel_comment") {
            const kws = config.keywords || [];
            autoSubtitle = `Keyword: ${Array.isArray(kws) ? kws.join(", ") : kws}`;
          } else if (nodeType === "action_send_product") {
            const p = db.state.products.find((prod) => prod.id === config.productId);
            autoSubtitle = `Product: ${p?.name || "Selected Product"}`;
          }

          return {
            ...n,
            data: {
              ...n.data,
              label: nodeLabel,
              subtitle: autoSubtitle,
              disabled: nodeDisabled,
              notes: nodeNotes,
              retryOnFail,
              config,
            },
          };
        }
        return n;
      })
    );

    setIsDirty(true);
    closeSettings();
    toast.success(`Updated "${nodeLabel}"`);
  };

  // Test Step Execution
  const handleTestStep = () => {
    setIsTestingStep(true);

    setTimeout(() => {
      // Simulate running this single step with sample data
      const startTime = Date.now();
      const product = db.state.products.find((p) => p.id === (config.productId || "prod_2"));

      let producedOutput = {
        ...sampleInput,
        executedAt: new Date().toISOString(),
        nodeType,
        stepSuccess: true,
      };

      if (nodeType === "trigger_reel_comment") {
        producedOutput.triggerType = "reel_comment";
        producedOutput.matchedKeyword = (triggerKeyword || "BUY").toUpperCase();
        producedOutput.commentText = triggerKeyword || "BUY";
      } else if (nodeType === "action_send_dm") {
        producedOutput.sentMessage = (config.messageText || "")
          .replace(/\{\{username\}\}/g, sampleInput.username)
          .replace(/\{\{product_name\}\}/g, product?.name || "Gold Necklace")
          .replace(/\{\{product_url\}\}/g, product?.productUrl || "https://urbanstyle.in");
        producedOutput.dmDelivered = true;
      } else if (nodeType === "action_add_tag") {
        producedOutput.appliedTags = config.tagIds || ["tag_3"];
      } else if (nodeType === "logic_if") {
        producedOutput.conditionResult = true;
      }

      const duration = Math.floor(Math.random() * 40 + 15);

      const result = {
        status: "success",
        duration,
        inputItems: [sampleInput],
        outputItems: [producedOutput],
        error: null,
      };

      setTestResult(result);
      const currentExecResults = useWorkflowEditorStore.getState().executionResults;
      setExecutionResults({
        ...currentExecResults,
        [settingsNodeId]: result,
      });

      setIsTestingStep(false);
      toast.success(`Test step executed in ${duration}ms`);
    }, 400);
  };

  const selectedProduct = availableProducts.find(
    (p) => p.id === (config.productId || "prod_2")
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4">
      {/* 3-Column Modal Container */}
      <div className="bg-white rounded-[16px] shadow-xl border border-[#E2E8F0] w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 px-5 border-b border-[#F1F5F9] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-[8px] flex items-center justify-center border"
              style={{
                backgroundColor: `${def.accentColor}15`,
                borderColor: `${def.accentColor}40`,
                color: def.accentColor,
              }}
            >
              <def.icon className="h-4 w-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  className="font-bold text-sm text-[#1E293B] border-b border-transparent hover:border-[#CBD5E1] focus:border-[#635BDB] focus:outline-hidden px-1"
                />
                <span className="text-[10px] uppercase font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                  {def.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeSettings}
              className="h-8 text-xs text-[#64748B]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="h-8 px-4 text-xs font-semibold bg-[#635BDB] hover:bg-[#5248c8] text-white shadow-xs"
            >
              Save Parameters
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeSettings}
              className="h-8 w-8 text-[#94A3B8] hover:text-[#1E293B]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 3 Columns Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#F1F5F9]">
          {/* COLUMN 1: INPUT DATA PREVIEW (Left, 3 cols) */}
          <div className="lg:col-span-3 bg-[#F8FAFC] flex flex-col overflow-hidden max-h-[30vh] lg:max-h-full">
            <div className="p-3 border-b border-[#F1F5F9] flex items-center justify-between shrink-0 bg-white">
              <span className="font-bold text-xs text-[#1E293B] flex items-center gap-1.5">
                <span>INPUT DATA</span>
                <span className="text-[10px] text-[#64748B] font-normal">(1 Item)</span>
              </span>

              <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[6px]">
                <button
                  type="button"
                  onClick={() => setLeftViewMode("json")}
                  className={cn(
                    "p-1 rounded-[4px] text-xs transition-colors",
                    leftViewMode === "json" ? "bg-white text-[#635BDB] shadow-2xs font-bold" : "text-[#64748B]"
                  )}
                  title="JSON view"
                >
                  <Code className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setLeftViewMode("table")}
                  className={cn(
                    "p-1 rounded-[4px] text-xs transition-colors",
                    leftViewMode === "table" ? "bg-white text-[#635BDB] shadow-2xs font-bold" : "text-[#64748B]"
                  )}
                  title="Table view"
                >
                  <TableIcon className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
              {leftViewMode === "json" ? (
                <pre className="text-[#334155] whitespace-pre-wrap bg-white p-3 rounded-[8px] border border-[#E2E8F0]">
                  {JSON.stringify(sampleInput, null, 2)}
                </pre>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(sampleInput).map(([k, v]) => (
                    <div
                      key={k}
                      className="p-2 rounded-[6px] bg-white border border-[#E2E8F0] flex flex-col text-xs font-sans"
                    >
                      <span className="font-bold text-[10px] text-[#64748B] uppercase">{k}</span>
                      <span className="text-xs text-[#1E293B] truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-white border-t border-[#F1F5F9] text-[10px] text-[#64748B]">
              Payload received from preceding workflow trigger or step.
            </div>
          </div>

          {/* COLUMN 2: PARAMETERS FORM (Center, 6 cols) */}
          <div className="lg:col-span-6 flex flex-col overflow-hidden bg-white">
            {/* Tabs Bar */}
            <div className="p-3 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("parameters")}
                  className={cn(
                    "px-3 py-1 rounded-[6px] text-xs font-bold transition-colors",
                    activeTab === "parameters" ? "bg-[#EEF2FF] text-[#635BDB]" : "text-[#64748B] hover:text-[#1E293B]"
                  )}
                >
                  Parameters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={cn(
                    "px-3 py-1 rounded-[6px] text-xs font-bold transition-colors",
                    activeTab === "settings" ? "bg-[#EEF2FF] text-[#635BDB]" : "text-[#64748B] hover:text-[#1E293B]"
                  )}
                >
                  Node Settings
                </button>
              </div>

              {/* Live Test Step Trigger Button */}
              <Button
                type="button"
                size="sm"
                onClick={handleTestStep}
                disabled={isTestingStep}
                className="h-7 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>{isTestingStep ? "Testing..." : "Test Step"}</span>
              </Button>
            </div>

            {/* Tab 1: Parameters Form */}
            {activeTab === "parameters" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* 1. REEL COMMENT TRIGGER */}
                {nodeType === "trigger_reel_comment" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">
                        Trigger Keywords (Comma separated)
                      </Label>
                      <Input
                        value={
                          Array.isArray(config.keywords)
                            ? config.keywords.join(", ")
                            : config.keywords || ""
                        }
                        onChange={(e) =>
                          handleConfigChange(
                            "keywords",
                            e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
                          )
                        }
                        placeholder="BUY, LINK, PRICE, GOLD"
                        className="mt-1 h-9 text-xs"
                      />
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Any comment matching one of these words will initiate the workflow.
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Match Type</Label>
                      <Select
                        value={config.matchType || "contains"}
                        onValueChange={(val) => handleConfigChange("matchType", val)}
                      >
                        <SelectTrigger className="mt-1 h-9 text-xs bg-white border-[#CBD5E1]">
                          <SelectValue placeholder="Select match type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Contains (e.g. "I want to BUY this")</SelectItem>
                          <SelectItem value="exact">Exact match ("BUY" only)</SelectItem>
                          <SelectItem value="starts_with">Starts with keyword</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Associated Reel Post</Label>
                      <Select
                        value={config.reelId || "reel_1"}
                        onValueChange={(val) => handleConfigChange("reelId", val)}
                      >
                        <SelectTrigger className="mt-1 h-9 text-xs bg-white border-[#CBD5E1]">
                          <SelectValue placeholder="Select Reel Post" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableReels.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.caption ? `${r.caption.slice(0, 48)}...` : r.instagramPostId} ({r.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-[#1E293B]">
                          Public Comment Reply
                        </Label>
                        <input
                          type="checkbox"
                          checked={config.replyToCommentPublicly !== false}
                          onChange={(e) =>
                            handleConfigChange("replyToCommentPublicly", e.target.checked)
                          }
                          className="h-4 w-4 rounded accent-[#635BDB]"
                        />
                      </div>
                      <Input
                        value={config.publicReplyText || ""}
                        onChange={(e) => handleConfigChange("publicReplyText", e.target.value)}
                        placeholder="Sent you the link in your DMs! Check requests 📩"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 2. SEND INSTAGRAM DM ACTION */}
                {nodeType === "action_send_dm" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-[#1E293B]">
                          DM Message Template
                        </Label>
                        <span className="text-[10px] text-[#64748B]">Click chip to insert</span>
                      </div>

                      {/* Variable Chips */}
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {VARIABLE_CHIPS.map((chip) => (
                          <button
                            key={chip.expr}
                            type="button"
                            onClick={() => handleInsertVariable(chip.expr)}
                            className="text-[10px] font-semibold bg-[#EEF2FF] text-[#635BDB] hover:bg-[#635BDB] hover:text-white px-2 py-0.5 rounded-[4px] transition-colors border border-[#C7D2FE]"
                          >
                            +{chip.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        ref={messageInputRef}
                        rows={4}
                        value={config.messageText || ""}
                        onChange={(e) => handleConfigChange("messageText", e.target.value)}
                        placeholder="Hey {{username}}! Tap below to shop {{product_name}}: {{product_url}}"
                        className="w-full rounded-[8px] border border-[#CBD5E1] p-3 text-xs leading-relaxed focus:border-[#635BDB] focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-[#1E293B]">Primary Button Text</Label>
                        <Input
                          value={config.buttonText || "Shop Now"}
                          onChange={(e) => handleConfigChange("buttonText", e.target.value)}
                          placeholder="Shop Now"
                          className="mt-1 h-8 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-[#1E293B]">Target Product Link</Label>
                        <Select
                          value={config.productId || "prod_2"}
                          onValueChange={(val) => handleConfigChange("productId", val)}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs bg-white border-[#CBD5E1]">
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {availableProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({formatINR(p.price)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Live Instagram Smartphone Preview for DM Node */}
                    <div className="pt-3 border-t border-[#F1F5F9]">
                      <Label className="text-xs font-bold text-[#635BDB] mb-2 flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5" />
                        <span>Live Instagram DM Preview</span>
                      </Label>
                      <div className="py-2">
                        <MessagePreview
                          message={config.messageText || ""}
                          product={selectedProduct}
                          buttonText={config.buttonText || "Shop Now"}
                          quickReplies={config.quickReplies || ["Size Chart", "Return Policy"]}
                          triggerKeyword="GOLD"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SEND PRODUCT LINK */}
                {nodeType === "action_send_product" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Select Product</Label>
                      <Select
                        value={config.productId || "prod_1"}
                        onValueChange={(val) => handleConfigChange("productId", val)}
                      >
                        <SelectTrigger className="mt-1 h-9 text-xs bg-white border-[#CBD5E1]">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — {formatINR(p.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Custom Link Message</Label>
                      <Input
                        value={config.customMessage || ""}
                        onChange={(e) => handleConfigChange("customMessage", e.target.value)}
                        placeholder="Here is the link for {{product_name}}: {{product_url}}"
                        className="mt-1 h-9 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 4. ADD / REMOVE TAG */}
                {(nodeType === "action_add_tag" || nodeType === "action_remove_tag") && (
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-[#1E293B]">Select CRM Tags</Label>
                    <div className="space-y-2">
                      {availableTags.map((t) => {
                        const isChecked = (config.tagIds || []).includes(t.id);
                        return (
                          <label
                            key={t.id}
                            className="flex items-center gap-2.5 p-2 rounded-[8px] border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = config.tagIds || [];
                                const updated = e.target.checked
                                  ? [...current, t.id]
                                  : current.filter((id) => id !== t.id);
                                handleConfigChange("tagIds", updated);
                              }}
                              className="h-4 w-4 rounded accent-[#635BDB]"
                            />
                            <span className="font-semibold text-[#1E293B]">{t.name}</span>
                            <span className="text-[10px] text-[#94A3B8]">({t.id})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. LOGIC: IF CONDITION */}
                {nodeType === "logic_if" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Left Variable</Label>
                      <Input
                        value={config.leftVariable || "{{commentText}}"}
                        onChange={(e) => handleConfigChange("leftVariable", e.target.value)}
                        placeholder="{{commentText}} or {{ordersCount}}"
                        className="mt-1 h-9 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Condition Operator</Label>
                      <Select
                        value={config.operator || "contains"}
                        onValueChange={(val) => handleConfigChange("operator", val)}
                      >
                        <SelectTrigger className="mt-1 h-9 text-xs bg-white border-[#CBD5E1]">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Contains text</SelectItem>
                          <SelectItem value="equals">Equals exactly</SelectItem>
                          <SelectItem value="not_equals">Does not equal</SelectItem>
                          <SelectItem value="greater_than">Greater than (&gt;)</SelectItem>
                          <SelectItem value="is_empty">Is empty</SelectItem>
                          <SelectItem value="is_not_empty">Is not empty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Right Value</Label>
                      <Input
                        value={config.rightValue || ""}
                        onChange={(e) => handleConfigChange("rightValue", e.target.value)}
                        placeholder="e.g. 'BUY' or '0'"
                        className="mt-1 h-9 text-xs"
                      />
                    </div>

                    <div className="p-3 rounded-[8px] bg-[#EEF2FF] border border-[#C7D2FE] text-[11px] text-[#635BDB]">
                      If the condition evaluates to true, data routes to the green <strong>True</strong> handle. Otherwise, it routes to the red <strong>False</strong> handle.
                    </div>
                  </div>
                )}

                {/* 6. LOGIC: WAIT */}
                {nodeType === "logic_wait" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-[#1E293B]">Duration</Label>
                        <Input
                          type="number"
                          min={1}
                          value={config.duration || 15}
                          onChange={(e) => handleConfigChange("duration", Number(e.target.value))}
                          className="mt-1 h-9 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-[#1E293B]">Unit</Label>
                        <Select
                          value={config.unit || "minutes"}
                          onValueChange={(val) => handleConfigChange("unit", val)}
                        >
                          <SelectTrigger className="mt-1 h-9 text-xs bg-white border-[#CBD5E1]">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Simulates a delay before proceeding to downstream nodes in this branch.
                    </p>
                  </div>
                )}

                {/* Fallback for other node types */}
                {!["trigger_reel_comment", "action_send_dm", "action_send_product", "action_add_tag", "action_remove_tag", "logic_if", "logic_wait"].includes(nodeType) && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold text-[#1E293B]">Configuration JSON</Label>
                      <textarea
                        rows={8}
                        value={JSON.stringify(config, null, 2)}
                        onChange={(e) => {
                          try {
                            setConfig(JSON.parse(e.target.value));
                          } catch (_) {}
                        }}
                        className="mt-1 w-full font-mono text-xs p-3 border border-[#CBD5E1] rounded-[8px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Settings Tab */}
            {activeTab === "settings" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <Label className="text-xs font-bold text-[#1E293B]">Custom Node Title</Label>
                  <Input
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-[#1E293B]">Documentation Notes</Label>
                  <textarea
                    rows={3}
                    value={nodeNotes}
                    onChange={(e) => setNodeNotes(e.target.value)}
                    placeholder="Describe the business logic or rationale for this step..."
                    className="mt-1 w-full rounded-[8px] border border-[#CBD5E1] p-3 text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-[#1E293B] block">Disable Node</span>
                      <span className="text-[11px] text-[#64748B]">
                        Disabled nodes pass input through without performing actions
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nodeDisabled}
                      onChange={(e) => setNodeDisabled(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#635BDB]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-[#1E293B] block">Retry on Failure</span>
                      <span className="text-[11px] text-[#64748B]">
                        Automatically retry step once if Instagram Graph API throttles
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={retryOnFail}
                      onChange={(e) => setRetryOnFail(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#635BDB]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3: OUTPUT DATA PREVIEW (Right, 3 cols) */}
          <div className="lg:col-span-3 bg-[#F8FAFC] flex flex-col overflow-hidden max-h-[30vh] lg:max-h-full">
            <div className="p-3 border-b border-[#F1F5F9] flex items-center justify-between shrink-0 bg-white">
              <span className="font-bold text-xs text-[#1E293B] flex items-center gap-1.5">
                <span>OUTPUT DATA</span>
                {testResult && (
                  <span className="text-[10px] text-emerald-600 font-bold">
                    ({testResult.duration}ms)
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[6px]">
                <button
                  type="button"
                  onClick={() => setRightViewMode("json")}
                  className={cn(
                    "p-1 rounded-[4px] text-xs transition-colors",
                    rightViewMode === "json" ? "bg-white text-[#635BDB] shadow-2xs font-bold" : "text-[#64748B]"
                  )}
                  title="JSON view"
                >
                  <Code className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setRightViewMode("table")}
                  className={cn(
                    "p-1 rounded-[4px] text-xs transition-colors",
                    rightViewMode === "table" ? "bg-white text-[#635BDB] shadow-2xs font-bold" : "text-[#64748B]"
                  )}
                  title="Table view"
                >
                  <TableIcon className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
              {testResult ? (
                rightViewMode === "json" ? (
                  <pre className="text-[#334155] whitespace-pre-wrap bg-white p-3 rounded-[8px] border border-[#E2E8F0]">
                    {JSON.stringify(testResult.outputItems?.[0] || testResult, null, 2)}
                  </pre>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(testResult.outputItems?.[0] || {}).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2 rounded-[6px] bg-white border border-[#E2E8F0] flex flex-col text-xs font-sans"
                      >
                        <span className="font-bold text-[10px] text-[#64748B] uppercase">{k}</span>
                        <span className="text-xs text-[#1E293B] truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-[#94A3B8] text-xs font-sans">
                  <p>Step has not been tested yet.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestStep}
                    disabled={isTestingStep}
                    className="mt-3 text-xs text-[#635BDB] border-[#C7D2FE]"
                  >
                    <Play className="h-3 w-3 mr-1 fill-current" />
                    <span>Run Test Step</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-white border-t border-[#F1F5F9] text-[10px] text-[#64748B]">
              Results generated by testing this node with sample data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
