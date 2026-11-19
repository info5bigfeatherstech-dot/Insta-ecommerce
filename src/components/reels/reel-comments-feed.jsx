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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/30">
            <CheckCircle2 className="h-3 w-3" />
            DM Sent
          </span>
        );
      case "No Trigger":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
            No Trigger
          </span>
        );
      case "Skipped":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning-soft text-warning border border-warning/30">
            Skipped
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive-soft text-destructive border border-destructive/30">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
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
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
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
          <div className="p-8 text-center rounded-[10px] border border-border bg-card space-y-1">
            <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-semibold text-foreground">No comments found</p>
            <p className="text-[11px] text-muted-foreground">
              Try adjusting your search filter, or use the Test Simulator tab to post a new comment.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-[10px] border border-border bg-card space-y-2 shadow-2xs hover:border-border/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary-soft text-primary text-[10px] font-bold">
                      {comment.avatar || getInitials(comment.customerName || comment.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-bold text-xs text-foreground block leading-none">
                      {comment.customerName || comment.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{comment.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(comment.timestamp)}
                  </span>
                  {getStatusBadge(comment.status)}
                </div>
              </div>

              {/* Comment Body */}
              <p className="text-xs text-foreground leading-relaxed pl-9">
                &ldquo;{comment.text}&rdquo;
              </p>

              {/* Public Reply (if present) */}
              {comment.publicReply && (
                <div className="ml-9 p-2 rounded-[6px] bg-success-soft border border-success/30 text-[11px] text-success flex items-start gap-1.5">
                  <span className="font-semibold text-success shrink-0">Brand Reply:</span>
                  <span>{comment.publicReply}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-[11px] text-muted-foreground text-right">
        Showing {filteredComments.length} of {comments.length} total comments on this Reel
      </div>
    </div>
  );
}
