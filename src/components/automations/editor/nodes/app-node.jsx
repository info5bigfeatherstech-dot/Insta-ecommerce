"use client";

import * as React from "react";
import { memo } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { getNodeDefinition } from "../node-catalog";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { cn } from "@/lib/utils";
import {
  Play,
  Settings,
  Trash2,
  Copy,
  Power,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

function generateDuplicateNodeId() {
  return `node_${Date.now()}`;
}

export const AppNode = memo(({ id, data, selected }) => {
  const { deleteElements, getNode, setNodes, getEdges, addNodes, addEdges } = useReactFlow();
  const openSettings = useWorkflowEditorStore((s) => s.openSettings);
  const openNodePanel = useWorkflowEditorStore((s) => s.openNodePanel);
  const execResult = useWorkflowEditorStore((s) => s.executionResults[id]);
  const isRunning = useWorkflowEditorStore((s) => s.activeSimulationNodeId === id);
  const setIsDirty = useWorkflowEditorStore((s) => s.setIsDirty);

  const nodeType = data?.nodeType || "action_send_dm";
  const def = getNodeDefinition(nodeType);
  const Icon = def?.icon || Settings;
  const isTrigger = def?.category === "trigger";
  const isIfNode = nodeType === "logic_if";
  const isSwitchNode = nodeType === "logic_switch";
  const isDisabled = data?.disabled === true;

  // Real-time execution status from state
  const execStatus = isRunning ? "running" : execResult?.status || "idle"; // idle, running, success, error, skipped
  const itemCount = execResult?.outputItems?.length;

  // Validation warnings on node
  const validationWarning = React.useMemo(() => {
    if (isTrigger && nodeType === "trigger_reel_comment") {
      const kws = data?.config?.keywords || [];
      if (kws.length === 0) return "Missing trigger keyword(s)";
    }
    if (nodeType === "action_send_dm") {
      if (!data?.config?.messageText?.trim()) return "Message template is required";
    }
    if (nodeType === "action_send_product") {
      if (!data?.config?.productId) return "No product selected";
    }
    return null;
  }, [nodeType, data?.config, isTrigger]);

  // Handle open settings dialog
  const handleOpenSettings = (e) => {
    e?.stopPropagation();
    openSettings(id);
  };

  // Toggle node enabled/disabled
  const handleToggleDisable = (e) => {
    e?.stopPropagation();
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              disabled: !n.data?.disabled,
            },
          };
        }
        return n;
      })
    );
    setIsDirty(true);
    toast.info(`Node "${data?.label || def.label}" ${isDisabled ? "enabled" : "disabled"}`);
  };

  // Duplicate node
  const handleDuplicate = React.useCallback(
    (e) => {
      e?.stopPropagation();
      const currentNode = getNode(id);
      if (!currentNode) return;

      const newId = generateDuplicateNodeId();
      const newNode = {
        ...currentNode,
        id: newId,
        position: {
          x: currentNode.position.x + 40,
          y: currentNode.position.y + 40,
        },
        data: {
          ...currentNode.data,
          label: `${currentNode.data?.label || def.label} (Copy)`,
        },
        selected: false,
      };

      addNodes([newNode]);
      setIsDirty(true);
      toast.success("Node duplicated");
    },
    [getNode, id, def?.label, addNodes, setIsDirty]
  );

  // Delete node
  const handleDelete = (e) => {
    e?.stopPropagation();
    deleteElements({ nodes: [{ id }] });
    setIsDirty(true);
    toast.success("Node removed");
  };

  // Quick plus on output handle to add downstream node
  const handleQuickAddOutput = (e, sourceHandle = "default") => {
    e?.stopPropagation();
    const currentNode = getNode(id);
    openNodePanel({
      sourceNodeId: id,
      sourceHandle,
      position: {
        x: (currentNode?.position?.x || 100) + 320,
        y: currentNode?.position?.y || 100,
      },
    });
  };

  // Status-dependent classes
  const statusBorderClass = {
    idle: selected ? "ring-2 ring-primary border-primary" : "border-border hover:border-border/80",
    running: "ring-2 ring-warning border-warning shadow-md animate-pulse",
    success: "ring-2 ring-success border-success shadow-xs",
    error: "ring-2 ring-destructive border-destructive shadow-md",
    skipped: "border-border opacity-60",
  }[execStatus];

  return (
    <div
      onDoubleClick={handleOpenSettings}
      className={cn(
        "group relative w-[250px] rounded-[14px] bg-card text-card-foreground transition-[border-color,box-shadow] duration-150 shadow-xs select-none",
        "border",
        statusBorderClass,
        isDisabled && "opacity-50 grayscale-20 bg-muted/60"
      )}
    >
      {/* Action Toolbar with hover-bridge and selected-state pinning */}
      <div
        className={cn(
          "absolute -top-11 left-1/2 -translate-x-1/2 pb-3.5 z-30 transition-all duration-150",
          selected
            ? "flex opacity-100 pointer-events-auto"
            : "hidden group-hover:flex group-hover:opacity-100 opacity-0 pointer-events-none group-hover:pointer-events-auto"
        )}
      >
        <div className="flex items-center gap-1 bg-popover text-popover-foreground px-2 py-1 rounded-[8px] shadow-lg border border-border">
          <button
            type="button"
            onClick={handleOpenSettings}
            title="Open settings (Double-click)"
            className="p-1.5 hover:bg-muted rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggleDisable}
            title={isDisabled ? "Enable node" : "Disable node"}
            className={cn(
              "p-1.5 hover:bg-muted rounded-[4px] transition-colors cursor-pointer",
              isDisabled ? "text-warning" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            title="Duplicate node (Ctrl+D)"
            className="p-1.5 hover:bg-muted rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Delete node (Delete key)"
            className="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded-[4px] text-muted-foreground transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Item Count Badge (Top-Right of Node) */}
      {execResult && execStatus !== "idle" && (
        <div
          onClick={handleOpenSettings}
          className={cn(
            "absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1 z-10",
            execStatus === "success" && "bg-success text-success-foreground",
            execStatus === "error" && "bg-destructive text-destructive-foreground",
            execStatus === "running" && "bg-warning text-warning-foreground animate-pulse",
            execStatus === "skipped" && "bg-muted-foreground text-card"
          )}
        >
          {execStatus === "running" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
          {execStatus === "success" && <Check className="h-2.5 w-2.5" />}
          {execStatus === "error" && <AlertCircle className="h-2.5 w-2.5" />}
          <span>{itemCount !== undefined ? `${itemCount} item${itemCount === 1 ? "" : "s"}` : execStatus}</span>
        </div>
      )}

      {/* Input Handle on Left (Excluded for Triggers) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-3 !h-3 !border-2 !border-card !bg-primary hover:!scale-125 !transition-transform !-left-1.5"
        />
      )}

      {/* Node Body Card */}
      <div className="p-3.5 flex items-start gap-3">
        {/* Node Icon Box with Category Color */}
        <div
          className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 border shadow-2xs"
          style={{
            backgroundColor: `${def.accentColor}15`,
            borderColor: `${def.accentColor}40`,
            color: def.accentColor,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Node Details (Title & Subtitle Summary) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 justify-between">
            <h4 className="text-xs font-bold text-foreground truncate">
              {data?.label || def.label}
            </h4>

            {/* Validation Warning Alert Icon */}
            {validationWarning && (
              <span title={validationWarning} className="text-destructive shrink-0">
                <AlertCircle className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">
            {data?.subtitle || def.defaultSubtitle}
          </p>

          {/* Category Tag / Sub-badge */}
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-[4px]"
              style={{
                backgroundColor: `${def.accentColor}15`,
                color: def.accentColor,
              }}
            >
              {def.category.replace("action_", "")}
            </span>

            {isDisabled && (
              <span className="text-[9px] font-semibold bg-muted text-muted-foreground px-1 rounded-[3px]">
                Disabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Output Handles */}
      {isIfNode ? (
        // IF NODE: Two distinct labeled output handles
        <div className="border-t border-border px-3 py-2 flex flex-col gap-1.5 bg-muted/40 rounded-b-[14px] text-[10px] font-bold">
          {/* True Handle */}
          <div className="relative flex items-center justify-between text-success">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span>True</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!w-3 !h-3 !border-2 !border-card !bg-success hover:!scale-125 !transition-transform !-right-1.5"
            />
          </div>

          {/* False Handle */}
          <div className="relative flex items-center justify-between text-destructive">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span>False</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!w-3 !h-3 !border-2 !border-card !bg-destructive hover:!scale-125 !transition-transform !-right-1.5"
            />
          </div>
        </div>
      ) : isSwitchNode ? (
        // SWITCH NODE: Labeled branches
        <div className="border-t border-border px-3 py-2 flex flex-col gap-1 bg-muted/40 rounded-b-[14px] text-[10px] font-bold">
          {(data?.config?.cases || [{ id: "case_1", label: "Case 1" }]).map((c, i) => (
            <div key={c.id} className="relative flex items-center justify-between text-warning">
              <span>{c.label || `Branch ${i + 1}`}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={c.id}
                className="!w-3 !h-3 !border-2 !border-card !bg-warning hover:!scale-125 !transition-transform !-right-1.5"
              />
            </div>
          ))}
          <div className="relative flex items-center justify-between text-muted-foreground">
            <span>Default</span>
            <Handle
              type="source"
              position={Position.Right}
              id="default"
              className="!w-3 !h-3 !border-2 !border-card !bg-muted-foreground hover:!scale-125 !transition-transform !-right-1.5"
            />
          </div>
        </div>
      ) : (
        // Standard Single Output Handle
        <div className="group/handle">
          <Handle
            type="source"
            position={Position.Right}
            id="default"
            className="!w-3 !h-3 !border-2 !border-card !bg-primary hover:!scale-125 !transition-transform !-right-1.5"
          />
          {/* Quick Plus button to add next node */}
          <button
            type="button"
            onClick={(e) => handleQuickAddOutput(e, "default")}
            title="Add next step"
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground shadow-xs text-[10px] z-20 hover:scale-125 transition-transform cursor-pointer"
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
});

AppNode.displayName = "AppNode";
