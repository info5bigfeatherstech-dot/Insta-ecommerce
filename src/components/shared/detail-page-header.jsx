"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DetailPageHeader({
  backHref = "/",
  backLabel = "Back",
  title,
  subtitle,
  badge,
  actions,
  children,
}) {
  const router = useRouter();

  const handleBack = () => {
    // Check if user came from inside the app via history
    if (typeof window !== "undefined" && window.history.length > 1 && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push(backHref);
    }
  };

  return (
    <div className="space-y-4 pb-2 border-b border-[#E2E8F0]">
      {/* Top Bar: Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 px-2.5 -ml-2.5 text-xs text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] font-semibold gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Button>

        {/* Optional top-right quick actions on small screens */}
        {actions && <div className="sm:hidden flex items-center gap-2">{actions}</div>}
      </div>

      {/* Main Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B]">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#64748B]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop actions */}
        {actions && (
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
