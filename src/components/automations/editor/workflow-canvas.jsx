"use client";

import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AppNode } from "./nodes/app-node";
import { StickyNote } from "./nodes/sticky-note";
import { CustomEdge } from "./edges/custom-edge";
import { NodePanel } from "./node-panel";
import { NodeSettingsDialog } from "./node-settings-dialog";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { useUIStore } from "@/store/ui-store";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import {
  Plus,
  FileText,
  LayoutGrid,
  Lock,
  Unlock,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  Sparkles,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Registered custom node types
const nodeTypes = {
  appNode: AppNode,
  stickyNote: StickyNote,
};

// Registered custom edge types
const edgeTypes = {
  deletableEdge: CustomEdge,
};

function generateStickyNoteId() {
  return `note_${Date.now()}`;
}

function getStickyNoteDefaultPosition() {
  return {
    x: 180 + Math.floor(Math.random() * 60),
    y: 120 + Math.floor(Math.random() * 40),
  };
}

export function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSaveWorkflow,
}) {
  const { getNode } = useReactFlow();
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const isDark = mounted && resolvedTheme === "dark";

  const {
    openNodePanel,
    closeNodePanel,
    isNodePanelOpen,
    setIsDirty,
    isDirty,
    inspectingExecution,
    setInspectingExecution,
    setActiveTab,
  } = useWorkflowEditorStore();

  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const reactFlowWrapper = useRef(null);
  const [isLocked, setIsLocked] = React.useState(false);

  // Undo / Redo history stacks
  const historyRef = useRef({ past: [], future: [] });

  // 1. Auto-collapse main app sidebar on mount for full canvas space
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  // Connect handler with validation rules
  const onConnect = useCallback(
    (params) => {
      // Rule 1: No connecting INTO a trigger node
      const targetNode = getNode(params.target);
      if (
        targetNode?.data?.category === "trigger" ||
        targetNode?.type?.startsWith("trigger_")
      ) {
        toast.error("Trigger nodes cannot receive incoming connections.");
        return;
      }

      // Rule 2: No self-loops
      if (params.source === params.target) {
        toast.error("Cannot connect a node to itself.");
        return;
      }

      const newEdge = {
        ...params,
        type: "deletableEdge",
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: "var(--canvas-edge-selected)",
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setIsDirty(true);
    },
    [getNode, setEdges, setIsDirty]
  );

  // Drag connection end onto empty canvas -> open node panel at that location
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid && connectionState.fromNode) {
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const bounds = reactFlowWrapper.current?.getBoundingClientRect();

        const position = {
          x: clientX - (bounds?.left || 0) - 100,
          y: clientY - (bounds?.top || 0) - 40,
        };

        openNodePanel({
          sourceNodeId: connectionState.fromNode.id,
          sourceHandle: connectionState.fromHandle?.id || "default",
          position,
        });
      }
    },
    [openNodePanel]
  );

  // Add Sticky Note directly to canvas
  const handleAddStickyNote = useCallback(() => {
    const newId = generateStickyNoteId();
    const newNote = {
      id: newId,
      type: "stickyNote",
      position: getStickyNoteDefaultPosition(),
      data: {
        text: "Add instructions or notes here...",
        color: "amber",
      },
    };
    setNodes((nds) => [...nds, newNote]);
    setIsDirty(true);
    toast.success("Sticky note added");
  }, [setNodes, setIsDirty]);

  // Auto-arrange / Tidy up layout algorithm
  const handleTidyUp = () => {
    const spacingX = 320;
    const spacingY = 160;

    // Arrange nodes sequentially based on graph order
    const orderedNodes = [...nodes];
    const triggerIndex = orderedNodes.findIndex(
      (n) => n.data?.category === "trigger" || n.type?.startsWith("trigger_")
    );

    if (triggerIndex > 0) {
      const [trig] = orderedNodes.splice(triggerIndex, 1);
      orderedNodes.unshift(trig);
    }

    setNodes((nds) =>
      nds.map((n, i) => {
        if (n.type === "stickyNote") return n;
        return {
          ...n,
          position: {
            x: 80 + i * spacingX,
            y: 180 + (i % 2 === 1 ? 20 : 0),
          },
        };
      })
    );
    setIsDirty(true);
    toast.success("Workflow auto-arranged");
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab opens nodes panel
      if (e.key === "Tab") {
        e.preventDefault();
        openNodePanel();
      }

      // Ctrl/Cmd + S saves workflow
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (onSaveWorkflow) onSaveWorkflow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openNodePanel, onSaveWorkflow]);

  // Read-only state if inspecting past execution run
  const isInspectionMode = Boolean(inspectingExecution);

  return (
    <div
      ref={reactFlowWrapper}
      className={cn(
        "relative flex-1 w-full h-[calc(100vh-130px)] min-h-[550px] bg-background overflow-hidden select-none",
        isDark && "dark"
      )}
    >
      {/* Execution Inspection Mode Top Banner */}
      {isInspectionMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-popover text-popover-foreground px-4 py-2 rounded-[12px] shadow-xl flex items-center gap-3 text-xs border border-border animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                inspectingExecution.status === "success"
                  ? "bg-success"
                  : "bg-destructive"
              )}
            />
            <span className="font-bold">
              Inspecting Execution: {inspectingExecution.id}
            </span>
            <span className="text-muted-foreground">
              ({inspectingExecution.duration}ms • {inspectingExecution.status})
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setInspectingExecution(null);
              setActiveTab("executions");
            }}
            className="h-6 px-2.5 text-[11px] font-bold bg-muted hover:bg-muted/80 text-foreground"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            <span>Back to Executions</span>
          </Button>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isInspectionMode || isLocked ? undefined : onNodesChange}
        onEdgesChange={isInspectionMode || isLocked ? undefined : onEdgesChange}
        onConnect={isInspectionMode || isLocked ? undefined : onConnect}
        onConnectEnd={isInspectionMode || isLocked ? undefined : onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.0}
        selectionOnDrag={!isLocked}
        panOnDrag={true}
        zoomOnScroll={true}
        style={{ backgroundColor: "var(--canvas-bg)" }}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "deletableEdge",
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: "var(--canvas-edge-selected)",
          },
        }}
      >
        {/* n8n-Style Dotted Grid Canvas */}
        <Background
          variant="dots"
          gap={22}
          size={1.5}
          color="var(--canvas-dots)"
          bgColor="var(--canvas-bg)"
          className="!bg-[var(--canvas-bg)]"
        />

        {/* MiniMap Docked Bottom Right */}
        <MiniMap
          nodeStrokeWidth={3}
          maskColor={isDark ? "rgba(15, 17, 23, 0.75)" : "rgba(240, 242, 245, 0.75)"}
          nodeColor={(node) => {
            if (node.type === "stickyNote") return "var(--warning)";
            if (node.data?.category === "trigger") return "var(--success)";
            if (node.data?.category === "logic") return "var(--warning)";
            return "var(--primary)";
          }}
          className="!rounded-[12px] !border !border-border !bg-card/90 !shadow-xs !overflow-hidden hidden sm:block"
        />

        {/* Canvas Toolbar Controls (Bottom Left) */}
        <Panel position="bottom-left" className="m-4 flex items-center gap-1.5">
          <div className="bg-card border border-border rounded-[10px] p-1 shadow-xs flex items-center gap-1 text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleTidyUp}
              title="Tidy Up / Auto-arrange layout"
              className="h-8 w-8 hover:text-primary hover:bg-muted"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsLocked(!isLocked)}
              title={isLocked ? "Unlock canvas" : "Lock canvas elements"}
              className={cn("h-8 w-8 hover:bg-muted", isLocked && "text-warning bg-warning-soft")}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
            <div className="h-4 w-px bg-border mx-0.5" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAddStickyNote}
              title="Add Sticky Note"
              className="h-8 w-8 hover:text-warning hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </Panel>

        {/* Floating Action Trigger Button to Add Nodes (Top Left of Canvas) */}
        {!isInspectionMode && (
          <Panel position="top-left" className="m-4 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => openNodePanel()}
              className="h-9 px-3.5 gap-2 rounded-[10px] bg-primary hover:bg-primary-hover text-primary-foreground shadow-md font-bold text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Node</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStickyNote}
              className="h-9 px-3 gap-1.5 rounded-[10px] bg-card border-border text-foreground hover:bg-muted shadow-2xs font-semibold text-xs"
            >
              <FileText className="h-3.5 w-3.5 text-warning" />
              <span>Add Note</span>
            </Button>
          </Panel>
        )}

        {/* Empty State Helper when workflow has no nodes */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto text-center p-8 border-2 border-dashed border-border rounded-[20px] bg-card/75 backdrop-blur-xs max-w-sm mx-4">
              <div className="h-12 w-12 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Workflow is empty</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
                Add your first trigger (e.g., Reel Comment or DM Keyword) to start automating sales.
              </p>
              <Button
                type="button"
                onClick={() => openNodePanel()}
                className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs h-8 px-4 font-bold shadow-xs"
              >
                Add First Step
              </Button>
            </div>
          </div>
        )}
      </ReactFlow>

      {/* Nodes Panel Drawer / Sheet */}
      <NodePanel />

      {/* 3-Column Node Settings Modal */}
      <NodeSettingsDialog />
    </div>
  );
}
