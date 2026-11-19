"use client";

import * as React from "react";
import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";
import { X, Plus } from "lucide-react";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { cn } from "@/lib/utils";

export const CustomEdge = memo(function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  sourceHandleId,
}) {
  const { setEdges, deleteElements } = useReactFlow();
  const openNodePanel = useWorkflowEditorStore((s) => s.openNodePanel);
  const setIsDirty = useWorkflowEditorStore((s) => s.setIsDirty);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
    setIsDirty(true);
  };

  const handleInsertNode = (e) => {
    e.stopPropagation();
    openNodePanel({
      sourceNodeId: source,
      sourceHandle: sourceHandleId,
      insertBetweenEdgeId: id,
      targetNodeId: target,
      position: {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
      },
    });
  };

  // Label text for IF true/false or switch handles
  const displayLabel = label || (sourceHandleId === "true" ? "True" : sourceHandleId === "false" ? "False" : null);

  const edgeStroke =
    sourceHandleId === "false"
      ? "var(--canvas-edge-false)"
      : sourceHandleId === "true"
      ? "var(--canvas-edge-true)"
      : "var(--primary)";

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: edgeStroke,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="group/edge-label flex items-center gap-1 z-10"
        >
          {/* Labeled Handle Badge (e.g. True / False) */}
          {displayLabel && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold shadow-2xs border select-none",
                displayLabel === "True"
                  ? "bg-success-soft border-success-border text-success"
                  : displayLabel === "False"
                  ? "bg-destructive-soft border-destructive-border text-destructive"
                  : "bg-card border-border text-foreground"
              )}
            >
              {displayLabel}
            </span>
          )}

          {/* Edge Action Buttons on Hover */}
          <div className="hidden group-hover/edge-label:flex items-center gap-1 bg-popover text-popover-foreground p-0.5 rounded-full shadow-md border border-border">
            <button
              type="button"
              onClick={handleInsertNode}
              title="Insert node between"
              className="h-4 w-4 rounded-full bg-muted hover:bg-primary flex items-center justify-center text-foreground hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete connection"
              className="h-4 w-4 rounded-full bg-muted hover:bg-destructive flex items-center justify-center text-foreground hover:text-destructive-foreground transition-colors cursor-pointer"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
