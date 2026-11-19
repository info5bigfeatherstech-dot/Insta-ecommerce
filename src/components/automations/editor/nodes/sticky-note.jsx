"use client";

import * as React from "react";
import { memo } from "react";
import { useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";

const COLOR_MAP = {
  amber: "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 placeholder:text-amber-400/70",
  blue: "bg-sky-50/90 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-950 dark:text-sky-200 placeholder:text-sky-400/70",
  green: "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 placeholder:text-emerald-400/70",
  purple: "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200 placeholder:text-indigo-400/70",
  rose: "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200 placeholder:text-rose-400/70",
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
        selected && "ring-2 ring-primary"
      )}
    >
      {/* Sticky Note Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
        {/* Color Palette Switcher */}
        <div className="flex items-center gap-1.5">
          {Object.keys(COLOR_MAP).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              className={cn(
                "h-3 w-3 rounded-full transition-transform hover:scale-125 cursor-pointer",
                c === "amber" && "bg-amber-400",
                c === "blue" && "bg-sky-400",
                c === "green" && "bg-emerald-400",
                c === "purple" && "bg-indigo-400",
                c === "rose" && "bg-rose-400",
                color === c && "ring-1.5 ring-foreground/40 scale-110"
              )}
            />
          ))}
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded cursor-pointer"
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
        className="flex-1 w-full bg-transparent resize-none border-0 p-1 mt-1 text-xs font-medium focus:outline-hidden leading-relaxed text-inherit"
      />
    </div>
  );
});

StickyNote.displayName = "StickyNote";
