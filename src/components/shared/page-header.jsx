import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  children,
  badge = null,
  className = "",
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground max-w-2xl capitalize">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
