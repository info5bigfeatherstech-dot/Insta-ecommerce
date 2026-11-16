"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchInput({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-7 h-8 text-xs bg-white border-[#E2E8F0]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-2 text-[#94A3B8] hover:text-[#1E293B]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
