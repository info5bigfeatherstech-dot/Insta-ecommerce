import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ text = "Loading records...", className = "" }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-3", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-[#635BDB]" />
      <p className="text-xs text-[#64748B] font-medium">{text}</p>
    </div>
  );
}
