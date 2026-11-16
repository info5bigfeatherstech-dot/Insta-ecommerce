import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status = "active", className = "" }) {
  const norm = String(status).toLowerCase();

  switch (norm) {
    case "active":
    case "delivered":
    case "paid":
    case "connected":
    case "successful":
      return (
        <Badge variant="success" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {status}
        </Badge>
      );

    case "shipped":
    case "processing":
    case "returning":
      return (
        <Badge variant="blue" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {status}
        </Badge>
      );

    case "pending":
    case "invited":
      return (
        <Badge variant="warning" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {status}
        </Badge>
      );

    case "inactive":
    case "disconnected":
    case "unassigned":
      return (
        <Badge variant="secondary" className={cn("capitalize gap-1 text-[#64748B]", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
          {status}
        </Badge>
      );

    case "cancelled":
    case "failed":
    case "refunded":
    case "deleted":
      return (
        <Badge variant="destructive" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {status}
        </Badge>
      );

    case "new":
      return (
        <Badge variant="indigo" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#635BDB]" />
          {status}
        </Badge>
      );

    default:
      return (
        <Badge variant="secondary" className={cn("capitalize", className)}>
          {status}
        </Badge>
      );
  }
}
