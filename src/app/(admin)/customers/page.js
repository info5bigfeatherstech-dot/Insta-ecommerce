"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomers } from "@/hooks/use-customers";
import { useListFilterStore } from "@/store/list-filter-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
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
} from "lucide-react";
import { db } from "@/data/db";

export default function CustomersPage() {
  const router = useRouter();

  // Persistent list filter state
  const { customers: filterState, setCustomersFilter } = useListFilterStore();
  const { search, status, tag, page } = filterState;

  const { data, isLoading } = useCustomers({
    search,
    status,
    tag,
    page,
    limit: 10,
  });

  const allTags = db.state.tags;

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
            <Avatar className="h-9 w-9 border border-[#E2E8F0]">
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
              <span className="font-semibold text-xs text-[#1E293B] block hover:text-[#635BDB]">
                {val}
              </span>
              <span className="text-[10px] text-[#635BDB] font-medium block">
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
      render: (val) => <span className="font-mono text-[10px] text-[#64748B]">{val}</span>,
    },
    {
      key: "sourceReel",
      label: "Source Reel",
      render: (reel) => (
        <span className="text-xs text-[#64748B] truncate max-w-[140px] block" title={reel?.caption}>
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
            <span className="text-[10px] text-[#64748B] font-semibold bg-[#F1F5F9] px-1 rounded">
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
      render: (val) => <span className="text-xs font-semibold text-[#1E293B]">{val}</span>,
    },
    {
      key: "lastInteraction",
      label: "Last Seen",
      sortable: true,
      render: (val) => <span className="text-xs text-[#64748B]">{formatRelativeTime(val)}</span>,
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
            className="h-7 px-2.5 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1 font-semibold"
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
        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Contacts</span>
            <Users className="h-4 w-4 text-[#635BDB]" />
          </div>
          <p className="text-2xl font-bold text-[#1E293B] mt-1.5">{stats.total}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-indigo-600">
            <span>New Leads</span>
            <UserPlus className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-1.5">{stats.new}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Active Shoppers</span>
            <Activity className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1.5">{stats.active}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>Returning Buyers</span>
            <RotateCcw className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1.5">{stats.returning}</p>
        </Card>
      </div>

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
