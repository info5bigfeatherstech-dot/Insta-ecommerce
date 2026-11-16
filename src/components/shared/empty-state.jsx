import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "No data found",
  description = "No entries matching your filter criteria were found.",
  icon: Icon = Inbox,
  action = null,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-[12px] border border-dashed border-[#E2E8F0] bg-white",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-[#1E293B] mb-1">{title}</h4>
      <p className="text-xs text-[#64748B] max-w-sm mb-4">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
