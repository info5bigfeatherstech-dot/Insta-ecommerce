"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { Search, MessageSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function ReelCommentsFeed({ reel }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const comments = reel.comments || [];

  const filteredComments = comments.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesText = c.text && c.text.toLowerCase().includes(q);
      const matchesUser = c.username && c.username.toLowerCase().includes(q);
      const matchesName = c.customerName && c.customerName.toLowerCase().includes(q);
      return matchesText || matchesUser || matchesName;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "DM Sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            DM Sent
          </span>
        );
      case "No Trigger":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            No Trigger
          </span>
        );
      case "Skipped":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Skipped
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comment text or username..."
            className="pl-8 h-9 text-xs"
          />
        </div>
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Comments" },
            { value: "DM Sent", label: "DM Sent (Triggered)" },
            { value: "No Trigger", label: "No Trigger Match" },
            { value: "Skipped", label: "Skipped (Duplicate/Inactive)" },
          ]}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-2.5">
        {filteredComments.length === 0 ? (
          <div className="p-8 text-center rounded-[10px] border border-[#E2E8F0] bg-white space-y-1">
            <MessageSquare className="h-6 w-6 text-[#94A3B8] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#1E293B]">No comments found</p>
            <p className="text-[11px] text-[#64748B]">
              Try adjusting your search filter, or use the Test Simulator tab to post a new comment.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-[10px] border border-[#E2E8F0] bg-white space-y-2 shadow-2xs hover:border-[#CBD5E1] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-[#635BDB] text-white text-[10px] font-bold">
                      {comment.avatar || getInitials(comment.customerName || comment.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-bold text-xs text-[#1E293B] block leading-none">
                      {comment.customerName || comment.username}
                    </span>
                    <span className="text-[10px] text-[#64748B]">{comment.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#94A3B8]">
                    {formatRelativeTime(comment.timestamp)}
                  </span>
                  {getStatusBadge(comment.status)}
                </div>
              </div>

              {/* Comment Body */}
              <p className="text-xs text-[#1E293B] leading-relaxed pl-9">
                &ldquo;{comment.text}&rdquo;
              </p>

              {/* Public Reply (if present) */}
              {comment.publicReply && (
                <div className="ml-9 p-2 rounded-[6px] bg-[#ECFDF5] border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                  <span className="font-semibold text-emerald-700 shrink-0">Brand Reply:</span>
                  <span>{comment.publicReply}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-[11px] text-[#94A3B8] text-right">
        Showing {filteredComments.length} of {comments.length} total comments on this Reel
      </div>
    </div>
  );
}
