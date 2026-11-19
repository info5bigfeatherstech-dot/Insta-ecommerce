"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAutomations,
  useToggleAutomation,
  useDuplicateAutomation,
  useDeleteAutomation,
} from "@/hooks/use-automations";
import { useListFilterStore } from "@/store/list-filter-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { formatNumber, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Copy,
  Edit2,
  Trash2,
  MoreVertical,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AUTOMATION_TRIGGERS } from "@/lib/constants";

function AutomationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const urlSearch = searchParams?.get("search") ?? "";
  const urlStatus = searchParams?.get("status") ?? "all";
  const urlTrigger = searchParams?.get("trigger") ?? "all";
  const urlSort = searchParams?.get("sort") ?? "lastUpdated";
  const urlDir = searchParams?.get("dir") ?? "desc";

  // Persistent list filter state fallback
  const { automations: filterState, setAutomationsFilter } = useListFilterStore();

  const [search, setSearch] = React.useState(urlSearch || filterState.search || "");
  const [status, setStatus] = React.useState(
    urlStatus !== "all" ? urlStatus : filterState.status || "all"
  );
  const [triggerType, setTriggerType] = React.useState(
    urlTrigger !== "all" ? urlTrigger : filterState.triggerType || "all"
  );
  const [sortColumn, setSortColumn] = React.useState(urlSort);
  const [sortDirection, setSortDirection] = React.useState(urlDir);

  const [deletingAuto, setDeletingAuto] = React.useState(null);

  // Sync state to URL search parameters
  const syncToUrl = React.useCallback(
    (newSearch, newStatus, newTrigger, newSort, newDir) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newStatus && newStatus !== "all") params.set("status", newStatus);
      if (newTrigger && newTrigger !== "all") params.set("trigger", newTrigger);
      if (newSort && newSort !== "lastUpdated") params.set("sort", newSort);
      if (newDir && newDir !== "desc") params.set("dir", newDir);

      const qs = params.toString();
      const targetUrl = qs ? `/automations?${qs}` : "/automations";
      if (typeof window !== "undefined") {
        window.history.replaceState(window.history.state, "", targetUrl);
      }
      setAutomationsFilter({ search: newSearch, status: newStatus, triggerType: newTrigger });
    },
    [setAutomationsFilter]
  );

  const handleSearchChange = (val) => {
    setSearch(val);
    syncToUrl(val, status, triggerType, sortColumn, sortDirection);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    syncToUrl(search, val, triggerType, sortColumn, sortDirection);
  };

  const handleTriggerChange = (val) => {
    setTriggerType(val);
    syncToUrl(search, status, val, sortColumn, sortDirection);
  };

  const handleSort = (col, dir) => {
    setSortColumn(col);
    setSortDirection(dir);
    syncToUrl(search, status, triggerType, col, dir);
  };

  const { data, isLoading } = useAutomations({
    search,
    status,
    triggerType,
    sortBy: sortColumn,
    sortOrder: sortDirection,
  });

  const toggleMutation = useToggleAutomation();
  const duplicateMutation = useDuplicateAutomation();
  const deleteMutation = useDeleteAutomation();

  const stats = data?.stats || {
    total: 0,
    active: 0,
    executions: 0,
    successful: 0,
    failed: 0,
  };

  const automations = data?.automations || [];

  const handleDeleteConfirm = async () => {
    if (deletingAuto) {
      await deleteMutation.mutateAsync(deletingAuto.id);
      setDeletingAuto(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Automation Name",
      sortable: true,
      render: (val, row) => {
        const keywords =
          row.triggerKeywords && row.triggerKeywords.length > 0
            ? row.triggerKeywords
            : row.triggerKeyword
            ? [row.triggerKeyword]
            : [];
        return (
          <div>
            <Link
              href={`/automations/${row.id}`}
              className="font-semibold text-xs text-foreground hover:text-primary block"
            >
              {val}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">
                Keywords: {keywords.length > 0 ? keywords.join(", ") : "None"}
              </span>
              {row.reel && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                  Reel: {row.reel.instagramPostId}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "triggerType",
      label: "Trigger Type",
      sortable: true,
      render: (val) => {
        const trigger = AUTOMATION_TRIGGERS.find((t) => t.id === val);
        return (
          <span className="text-xs text-foreground font-medium">
            {trigger?.label || val}
          </span>
        );
      },
    },
    {
      key: "product",
      label: "Attached Product",
      render: (prod) => (
        <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
          {prod?.name || "—"}
        </span>
      ),
    },
    {
      key: "executions",
      label: "Executions",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-foreground">{formatNumber(val)}</span>,
    },
    {
      key: "messagesSent",
      label: "DMs Sent",
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-foreground">{formatNumber(val)}</span>,
    },
    {
      key: "linkClicks",
      label: "Clicks",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-primary">{formatNumber(val)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      sortable: true,
      render: (val) => <span className="text-xs text-muted-foreground">{formatDate(val, "dd MMM")}</span>,
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
            onClick={() => router.push(`/automations/${row.id}`)}
            className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => toggleMutation.mutate(row.id)}
                className="text-xs gap-2"
              >
                {row.status === "active" ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-warning" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-success" />
                    <span>Activate</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/automations/create?duplicate=${row.id}`)}
                className="text-xs gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate Flow</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingAuto(row)}
                className="text-xs text-destructive focus:text-destructive gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations"
        description="Visual automation rules that convert Instagram Reel comments and DMs into product sales."
      >
        <Button asChild size="sm" className="gap-1.5 shadow-sm">
          <Link href="/automations/create">
            <Plus className="h-4 w-4" />
            <span>Create Automation</span>
          </Link>
        </Button>
      </PageHeader>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Active Workflows</span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1.5">
            {stats.active} <span className="text-xs font-normal text-muted-foreground">/ {stats.total} total</span>
          </p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Executions</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1.5">{formatNumber(stats.executions)}</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-success">
            <span>Successful Runs</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-success mt-1.5">{formatNumber(stats.successful)}</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between text-xs text-destructive">
            <span>Failed / Dropped</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-destructive mt-1.5">{stats.failed}</p>
        </Card>
      </div>

      {/* Automations Table */}
      <DataTable
        columns={columns}
        data={automations}
        isLoading={isLoading}
        searchPlaceholder="Search automation name, keyword..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(row) => router.push(`/automations/${row.id}`)}
        exportFilename="automations_catalog"
        filters={
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Status"
              value={status}
              onChange={handleStatusChange}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <FilterDropdown
              label="Trigger"
              value={triggerType}
              onChange={handleTriggerChange}
              options={[
                { value: "all", label: "All Triggers" },
                ...AUTOMATION_TRIGGERS.map((t) => ({ value: t.id, label: t.label })),
              ]}
            />
          </div>
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingAuto)}
        onOpenChange={(open) => !open && setDeletingAuto(null)}
        title="Delete Automation?"
        description={`Are you sure you want to delete "${deletingAuto?.name}"? Connected Reels will stop firing keyword DMs.`}
        confirmText="Delete Automation"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading automations..." />}>
      <AutomationsContent />
    </Suspense>
  );
}
