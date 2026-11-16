import * as React from "react";
import {
  Zap,
  UserCheck,
  ShoppingBag,
  Send,
  MousePointerClick,
  Activity,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_ICONS = {
  trigger: Zap,
  identify_contact: UserCheck,
  find_product: ShoppingBag,
  send_dm: Send,
  track_click: MousePointerClick,
  update_activity: Activity,
};

export function WorkflowNode({
  node,
  index,
  totalNodes,
  isSelected = false,
  onSelect,
  summary = "",
}) {
  const Icon = NODE_ICONS[node.id] || Zap;

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      {/* Node Box */}
      <div
        onClick={() => onSelect(node.id)}
        className={cn(
          "w-full rounded-[12px] border bg-white p-4 transition-all cursor-pointer shadow-xs relative",
          isSelected
            ? "border-[#635BDB] ring-2 ring-[#635BDB]/20 shadow-md"
            : "border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[8px] shrink-0",
                node.type === "trigger"
                  ? "bg-[#635BDB] text-white"
                  : isSelected
                  ? "bg-[#EEF2FF] text-[#635BDB]"
                  : "bg-[#F1F5F9] text-[#64748B]"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Step {index + 1} • {node.type}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#1E293B]">{node.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-[#64748B] font-medium">Configured</span>
          </div>
        </div>

        {summary && (
          <div className="mt-2.5 pt-2.5 border-t border-[#F1F5F9] text-xs text-[#64748B] flex items-center justify-between">
            <span className="truncate max-w-[280px] font-medium text-[#1E293B]">{summary}</span>
            <span className="text-[10px] text-[#635BDB] font-semibold hover:underline">
              Configure →
            </span>
          </div>
        )}
      </div>

      {/* Connecting Arrow */}
      {index < totalNodes - 1 && (
        <div className="flex flex-col items-center my-1.5 text-[#94A3B8]">
          <div className="h-4 w-0.5 bg-[#E2E8F0]" />
          <ArrowDown className="h-3.5 w-3.5 -mt-1 text-[#CBD5E1]" />
        </div>
      )}
    </div>
  );
}
