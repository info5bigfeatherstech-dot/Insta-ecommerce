"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomers } from "@/hooks/use-customers";
import { useListFilterStore } from "@/store/list-filter-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatINR,
  formatNumber,
  formatDate,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
} from "@/lib/utils";
import {
  Users,
  UserPlus,
  Activity,
  RotateCcw,
  Eye,
  ExternalLink,
  Layers,
  X,
} from "lucide-react";
import { db } from "@/data/db";

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const segmentParam = searchParams?.get("segment");

  // Persistent list filter state
  const { customers: filterState, setCustomersFilter } = useListFilterStore();
  const { search, status, tag, segment = "all", page } = filterState;

  // Sync segment query param from URL if present
  React.useEffect(() => {
    if (segmentParam && segmentParam !== segment) {
      setCustomersFilter({ segment: segmentParam, page: 1 });
    }
  }, [segmentParam, segment, setCustomersFilter]);

  const { data, isLoading } = useCustomers({
    search,
    status,
    tag,
    segment,
    page,
    limit: 10,
  });

  const allTags = db.state.tags;
  const allSegments = db.state.segments;
  const activeSegment = segment && segment !== "all"
    ? allSegments.find((s) => s.id === segment)
    : null;

  // Calculate live metrics from database
  const stats = React.useMemo(() => {
    const list = db.state.customers;
    return {
      total: list.length,
      new: list.filter((c) => c.status === "new").length,
      active: list.filter((c) => c.status === "active").length,
      returning: list.filter((c) => c.status === "returning").length,
    };
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Customer / Contact",
      render: (val, row) => {
        const palette = getAvatarColor(val);
        const initials = getInitials(val);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback
                style={{
                  backgroundColor: palette.bg,
                  color: palette.text,
                  border: `1px solid ${palette.border}`,
                }}
                className="font-bold text-xs"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-xs text-foreground block hover:text-primary">
                {val}
              </span>
              <span className="text-[10px] text-primary font-medium block">
                {row.username}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "instagramUserId",
      label: "Instagram ID",
      render: (val) => <span className="font-mono text-[10px] text-muted-foreground">{val}</span>,
    },
    {
      key: "sourceReel",
      label: "Source Reel",
      render: (reel) => (
        <span className="text-xs text-muted-foreground truncate max-w-[140px] block" title={reel?.caption}>
          {reel ? reel.instagramPostId : "Direct / Search"}
        </span>
      ),
    },
    {
      key: "tagObjects",
      label: "Tags",
      render: (tagObjs, row) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {(row.tags || []).slice(0, 2).map((tId) => {
            const t = allTags.find((tag) => tag.id === tId);
            if (!t) return null;
            return (
              <span
                key={t.id}
                style={{ backgroundColor: t.bgColor, color: t.color, borderColor: t.color }}
                className="text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium border border-opacity-30 truncate"
              >
                {t.name}
              </span>
            );
          })}
          {(row.tags || []).length > 2 && (
            <span className="text-[10px] text-muted-foreground font-semibold bg-muted px-1 rounded">
              +{row.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "totalMessages",
      label: "DMs Exchanged",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-foreground">{val}</span>,
    },
    {
      key: "lastInteraction",
      label: "Last Seen",
      sortable: true,
      render: (val) => <span className="text-xs text-muted-foreground">{formatRelativeTime(val)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/customers/${row.id}`)}
            className="h-7 px-2.5 text-xs text-primary hover:bg-primary-soft gap-1 font-semibold"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Profile</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers & Leads"
        description="Audience database captured automatically from Instagram Reels, comments, and direct messages."
      />

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Contacts</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">{stats.total}</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-primary">
            <span>New Leads</span>
            <UserPlus className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-primary mt-1.5">{stats.new}</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-success">
            <span>Active Shoppers</span>
            <Activity className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-success mt-1.5">{stats.active}</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-info">
            <span>Returning Buyers</span>
            <RotateCcw className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-info mt-1.5">{stats.returning}</p>
        </Card>
      </div>

      {/* Active Segment Banner */}
      {activeSegment && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-primary/30 bg-primary-soft/40 text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeSegment.color || "var(--primary)" }}
            />
            <div>
              <span className="font-semibold text-foreground">
                Active Dynamic Segment: {activeSegment.name}
              </span>
              <span className="text-muted-foreground ml-2">
                ({data?.pagination?.totalRecords ?? 0} matching contacts)
              </span>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {activeSegment.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCustomersFilter({ segment: "all", page: 1 });
              router.replace("/customers");
            }}
            className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear Segment</span>
          </Button>
        </div>
      )}

      {/* Customers DataTable */}
      <DataTable
        columns={columns}
        data={data?.customers || []}
        isLoading={isLoading}
        searchPlaceholder="Search customer name, handle, ID..."
        searchValue={search}
        onSearchChange={(val) => setCustomersFilter({ search: val, page: 1 })}
        onRowClick={(row) => router.push(`/customers/${row.id}`)}
        exportFilename="customers_list"
        filters={
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Segment"
              value={segment}
              onChange={(val) => {
                setCustomersFilter({ segment: val, page: 1 });
                if (val === "all") {
                  router.replace("/customers");
                } else {
                  router.replace(`/customers?segment=${val}`);
                }
              }}
              options={[
                { value: "all", label: "All Segments" },
                ...allSegments.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <FilterDropdown
              label="Status"
              value={status}
              onChange={(val) => setCustomersFilter({ status: val, page: 1 })}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "new", label: "New Leads" },
                { value: "active", label: "Active" },
                { value: "returning", label: "Returning" },
              ]}
            />
            <FilterDropdown
              label="Tag"
              value={tag}
              onChange={(val) => setCustomersFilter({ tag: val, page: 1 })}
              options={[
                { value: "all", label: "All Tags" },
                ...allTags.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>
        }
        pagination={{
          page: data?.pagination?.page || 1,
          limit: data?.pagination?.limit || 10,
          totalRecords: data?.pagination?.totalRecords || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: (newPage) => setCustomersFilter({ page: newPage }),
        }}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading customer directory..." />}>
      <CustomersContent />
    </Suspense>
  );
}
