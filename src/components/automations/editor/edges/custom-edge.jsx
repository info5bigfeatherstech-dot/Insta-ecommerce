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

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: sourceHandleId === "false" ? "#F43F5E" : "#635BDB",
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
                "px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold shadow-2xs border",
                displayLabel === "True"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : displayLabel === "False"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-white border-[#E2E8F0] text-[#1E293B]"
              )}
            >
              {displayLabel}
            </span>
          )}

          {/* Edge Action Buttons on Hover */}
          <div className="hidden group-hover/edge-label:flex items-center gap-1 bg-[#1E293B] text-white p-0.5 rounded-full shadow-md">
            <button
              type="button"
              onClick={handleInsertNode}
              title="Insert node between"
              className="h-4 w-4 rounded-full bg-white/20 hover:bg-[#635BDB] flex items-center justify-center text-white transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete connection"
              className="h-4 w-4 rounded-full bg-white/20 hover:bg-rose-500 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
