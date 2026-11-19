"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin Segment Error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive-soft text-destructive mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">Something went wrong</h2>
      <p className="text-xs text-muted-foreground max-w-md mb-6">
        {error?.message || "An unexpected error occurred while loading this view."}
      </p>
      <Button onClick={() => reset()} size="sm">
        Try Again
      </Button>
    </div>
  );
}
