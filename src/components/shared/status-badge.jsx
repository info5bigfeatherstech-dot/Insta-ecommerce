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
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {status}
        </Badge>
      );

    case "shipped":
    case "processing":
    case "returning":
      return (
        <Badge variant="blue" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-info" />
          {status}
        </Badge>
      );

    case "pending":
    case "invited":
      return (
        <Badge variant="warning" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          {status}
        </Badge>
      );

    case "inactive":
    case "disconnected":
    case "unassigned":
      return (
        <Badge variant="secondary" className={cn("capitalize gap-1 text-muted-foreground", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          {status}
        </Badge>
      );

    case "cancelled":
    case "failed":
    case "refunded":
    case "deleted":
      return (
        <Badge variant="destructive" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
          {status}
        </Badge>
      );

    case "new":
      return (
        <Badge variant="indigo" className={cn("capitalize gap-1", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
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
