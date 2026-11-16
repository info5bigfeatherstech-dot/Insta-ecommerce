import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[6px] border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#635BDB] focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#635BDB] text-white",
        secondary: "border-transparent bg-[#F1F5F9] text-[#1E293B]",
        destructive: "border-transparent bg-red-100 text-red-700",
        outline: "border-[#E2E8F0] text-[#1E293B] bg-white",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
        blue: "border-blue-200 bg-blue-50 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
