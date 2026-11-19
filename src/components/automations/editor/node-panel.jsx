"use client";

import * as React from "react";
import { useReactFlow } from "@xyflow/react";
import { NODE_CATALOG, NODE_CATEGORIES } from "./node-catalog";
import { WORKFLOW_TEMPLATES } from "./templates";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Plus,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function generateNodeId() {
  return `node_${Date.now()}`;
}

function getRandomDefaultPosition() {
  return {
    x: 350 + Math.floor(Math.random() * 80),
    y: 180 + Math.floor(Math.random() * 60),
  };
}

export function NodePanel() {
  const isNodePanelOpen = useWorkflowEditorStore((s) => s.isNodePanelOpen);

  if (!isNodePanelOpen) return null;

  return <NodePanelContent />;
}

function NodePanelContent() {
  const { closeNodePanel, nodePanelSourceInfo, setIsDirty } =
    useWorkflowEditorStore();
  const { addNodes, addEdges, getNodes, setNodes, setEdges, getNode } = useReactFlow();

  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const searchInputRef = React.useRef(null);

  // Focus search input on mount
  React.useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  // Filter catalog nodes by category and search
  const filteredNodes = NODE_CATALOG.filter((node) => {
    const matchesCat =
      selectedCategory === "all" || node.category === selectedCategory;
    const matchesQuery =
      search === "" ||
      node.label.toLowerCase().includes(search.toLowerCase()) ||
      node.description.toLowerCase().includes(search.toLowerCase()) ||
      node.type.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Add node to canvas and auto-connect if sourceInfo present
  const handleAddNode = React.useCallback(
    (nodeDef) => {
      const allNodes = getNodes();

      // Check single trigger constraint
      if (nodeDef.category === "trigger") {
        const existingTrigger = allNodes.find(
          (n) => n.data?.category === "trigger" || n.type?.startsWith("trigger_")
        );
        if (existingTrigger) {
          toast.error("Only one trigger node is allowed per workflow.");
          return;
        }
      }

      const newId = generateNodeId();
      const defaultPos = nodePanelSourceInfo?.position || getRandomDefaultPosition();

      const isSticky = nodeDef.type === "sticky_note";

      const newNode = {
        id: newId,
        type: isSticky ? "stickyNote" : "appNode",
        position: defaultPos,
        data: {
          nodeType: nodeDef.type,
          category: nodeDef.category,
          label: nodeDef.label,
          subtitle: nodeDef.defaultSubtitle,
          config: JSON.parse(JSON.stringify(nodeDef.defaultConfig || {})),
        },
      };

      addNodes([newNode]);

      // Handle auto-connecting if spawned from an existing node
      if (nodePanelSourceInfo?.sourceNodeId && !isSticky) {
        const sourceId = nodePanelSourceInfo.sourceNodeId;
        const sourceHandle = nodePanelSourceInfo.sourceHandle || "default";

        // If inserting between an existing edge
        if (nodePanelSourceInfo.insertBetweenEdgeId && nodePanelSourceInfo.targetNodeId) {
          const targetId = nodePanelSourceInfo.targetNodeId;

          // Remove the existing bridge edge
          setEdges((eds) =>
            eds
              .filter((e) => e.id !== nodePanelSourceInfo.insertBetweenEdgeId)
              .concat([
                {
                  id: `e_${sourceId}_${newId}`,
                  source: sourceId,
                  sourceHandle,
                  target: newId,
                  type: "deletableEdge",
                },
                {
                  id: `e_${newId}_${targetId}`,
                  source: newId,
                  sourceHandle: "default",
                  target: targetId,
                  type: "deletableEdge",
                },
              ])
          );
        } else {
          // Standard single downstream connection
          addEdges([
            {
              id: `e_${sourceId}_${newId}`,
              source: sourceId,
              sourceHandle,
              target: newId,
              type: "deletableEdge",
            },
          ]);
        }
      }

      setIsDirty(true);
      closeNodePanel();
      toast.success(`Added "${nodeDef.label}" to canvas`);
    },
    [getNodes, nodePanelSourceInfo, addNodes, setEdges, addEdges, setIsDirty, closeNodePanel]
  );

  // AI Prompt simulation to auto-generate a workflow from text
  const handleGenerateWithAi = React.useCallback(
    (e) => {
      e.preventDefault();
      if (!aiPrompt.trim()) return;

      setIsGeneratingAi(true);

      setTimeout(() => {
        // Find closest matching template
        const q = aiPrompt.toLowerCase();
        let matchedTemplate = WORKFLOW_TEMPLATES[0];

        if (q.includes("story")) {
          matchedTemplate = WORKFLOW_TEMPLATES[2];
        } else if (q.includes("vip") || q.includes("if") || q.includes("branch")) {
          matchedTemplate = WORKFLOW_TEMPLATES[1];
        } else if (q.includes("wait") || q.includes("abandon") || q.includes("recover")) {
          matchedTemplate = WORKFLOW_TEMPLATES[3];
        }

        setNodes(matchedTemplate.workflow.nodes);
        setEdges(matchedTemplate.workflow.edges);
        setIsDirty(true);
        setIsGeneratingAi(false);
        closeNodePanel();
        toast.success(`Generated workflow template: "${matchedTemplate.title}" (Simulated AI)`);
      }, 700);
    },
    [aiPrompt, setNodes, setEdges, setIsDirty, closeNodePanel]
  );

  return (
    <>
      {/* Backdrop for mobile bottom sheet */}
      <div
        onClick={closeNodePanel}
        className="fixed inset-0 bg-foreground/40 z-40 md:hidden backdrop-blur-2xs"
      />

      {/* Nodes Panel Container: Right Drawer on Desktop, Bottom Sheet on Mobile */}
      <div
        className={cn(
          "fixed z-50 bg-card text-card-foreground shadow-2xl border-l border-border flex flex-col transition-transform duration-200",
          // Desktop: Right Drawer
          "inset-y-0 right-0 w-full sm:w-[380px]",
          // Mobile: Bottom Sheet on small viewports
          "max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-h-[85vh] max-md:rounded-t-[20px] max-md:border-t"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>Add Node</span>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {NODE_CATALOG.length} Available
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select an action or trigger to insert into canvas
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeNodePanel}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Optional "Build with AI" Input Box */}
        <div className="p-3.5 bg-muted/40 border-b border-border">
          <form onSubmit={handleGenerateWithAi} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Build with AI (Prompt Simulation)</span>
              </span>
              <span className="text-[9px] font-normal text-muted-foreground">Simulated</span>
            </div>
            <div className="flex gap-1.5">
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'Reel comment BUY send 15% discount link'"
                className="h-8 text-xs bg-card border-border"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="h-8 px-3 text-xs bg-primary hover:bg-primary-hover text-primary-foreground shrink-0"
              >
                {isGeneratingAi ? "Generating..." : "Generate"}
              </Button>
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search triggers, actions, logic... (Press Tab)"
              className="pl-9 h-8 text-xs bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-3 text-[11px]">
            {NODE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-2.5 py-1 rounded-[6px] font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Node Catalog List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <p>No nodes found matching &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filteredNodes.map((node) => {
              const Icon = node.icon || Plus;
              return (
                <button
                  key={node.type}
                  type="button"
                  onClick={() => handleAddNode(node)}
                  className="w-full text-left p-2.5 rounded-[10px] border border-border hover:border-primary hover:bg-muted/50 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${node.accentColor}12`,
                      borderColor: `${node.accentColor}30`,
                      color: node.accentColor,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {node.label}
                      </span>
                      <span
                        className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded"
                        style={{
                          backgroundColor: `${node.accentColor}15`,
                          color: node.accentColor,
                        }}
                      >
                        {node.category.replace("action_", "")}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                      {node.description}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 bg-muted/40 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Tip: Press Tab anytime to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </>
  );
}
