"use client";

import * as React from "react";
import { memo } from "react";
import { useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";

const COLOR_MAP = {
  amber: "bg-amber-50/90 border-amber-200 text-amber-900 placeholder:text-amber-400",
  blue: "bg-sky-50/90 border-sky-200 text-sky-900 placeholder:text-sky-400",
  green: "bg-emerald-50/90 border-emerald-200 text-emerald-900 placeholder:text-emerald-400",
  purple: "bg-indigo-50/90 border-indigo-200 text-indigo-900 placeholder:text-indigo-400",
  rose: "bg-rose-50/90 border-rose-200 text-rose-900 placeholder:text-rose-400",
};

export const StickyNote = memo(({ id, data, selected }) => {
  const { deleteElements, setNodes } = useReactFlow();
  const setIsDirty = useWorkflowEditorStore((s) => s.setIsDirty);

  const color = data?.color || "amber";
  const text = data?.text || "";

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, text: newText },
          };
        }
        return n;
      })
    );
    setIsDirty(true);
  };

  const handleColorChange = (newColor) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, color: newColor },
          };
        }
        return n;
      })
    );
    setIsDirty(true);
  };

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
    setIsDirty(true);
  };

  return (
    <div
      className={cn(
        "group relative rounded-[12px] border p-3 shadow-xs transition-[border-color,box-shadow] duration-150",
        "w-[240px] min-h-[140px] flex flex-col",
        COLOR_MAP[color] || COLOR_MAP.amber,
        selected && "ring-2 ring-[#635BDB]"
      )}
    >
      {/* Sticky Note Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5">
        {/* Color Palette Switcher */}
        <div className="flex items-center gap-1.5">
          {Object.keys(COLOR_MAP).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              className={cn(
                "h-3 w-3 rounded-full transition-transform hover:scale-125",
                c === "amber" && "bg-amber-400",
                c === "blue" && "bg-sky-400",
                c === "green" && "bg-emerald-400",
                c === "purple" && "bg-indigo-400",
                c === "rose" && "bg-rose-400",
                color === c && "ring-1.5 ring-black/40 scale-110"
              )}
            />
          ))}
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={handleDelete}
          className="text-black/40 hover:text-rose-600 transition-colors p-0.5 rounded"
          title="Delete note"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Note Textarea */}
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Type documentation note here..."
        className="flex-1 w-full bg-transparent resize-none border-0 p-1 mt-1 text-xs font-medium focus:outline-hidden leading-relaxed"
      />
    </div>
  );
});

StickyNote.displayName = "StickyNote";
