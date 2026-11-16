"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAutomations,
  useToggleAutomation,
  useDuplicateAutomation,
  useDeleteAutomation,
} from "@/hooks/use-automations";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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

export default function AutomationsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [triggerType, setTriggerType] = React.useState("all");
  const [deletingAuto, setDeletingAuto] = React.useState(null);

  const { data, isLoading } = useAutomations({
    search,
    status,
    triggerType,
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
      render: (val, row) => (
        <div>
          <Link
            href={`/automations/${row.id}`}
            className="font-semibold text-xs text-[#1E293B] hover:text-[#635BDB] block"
          >
            {val}
          </Link>
          <span className="text-[10px] text-[#64748B]">Keyword: '{row.triggerKeyword}'</span>
        </div>
      ),
    },
    {
      key: "triggerType",
      label: "Trigger Type",
      sortable: true,
      render: (val) => {
        const trigger = AUTOMATION_TRIGGERS.find((t) => t.id === val);
        return (
          <span className="text-xs text-[#1E293B] font-medium">
            {trigger?.label || val}
          </span>
        );
      },
    },
    {
      key: "product",
      label: "Attached Product",
      render: (prod) => (
        <span className="text-xs text-[#64748B] truncate max-w-[150px] block">
          {prod?.name || "—"}
        </span>
      ),
    },
    {
      key: "executions",
      label: "Executions",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#1E293B]">{formatNumber(val)}</span>,
    },
    {
      key: "messagesSent",
      label: "DMs Sent",
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-[#1E293B]">{formatNumber(val)}</span>,
    },
    {
      key: "linkClicks",
      label: "Clicks",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#635BDB]">{formatNumber(val)}</span>,
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
      render: (val) => <span className="text-xs text-[#94A3B8]">{formatDate(val, "dd MMM")}</span>,
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
            className="h-7 px-2 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#64748B]">
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
                    <Pause className="h-3.5 w-3.5 text-amber-600" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Activate</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => duplicateMutation.mutate(row.id)}
                className="text-xs gap-2"
              >
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingAuto(row)}
                className="text-xs gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
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
        description="Automated DM funnels triggered by Reel comments, story replies, and keyword messages."
      >
        <Button asChild size="sm" className="gap-1.5 shadow-sm">
          <Link href="/automations/create">
            <Plus className="h-4 w-4" />
            <span>Create Automation</span>
          </Link>
        </Button>
      </PageHeader>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Automations</span>
            <Zap className="h-4 w-4 text-[#635BDB]" />
          </div>
          <p className="text-xl font-bold text-[#1E293B] mt-1.5">{stats.total}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Active Workflows</span>
            <Play className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1.5">{stats.active}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Executions</span>
            <Activity className="h-4 w-4 text-[#635BDB]" />
          </div>
          <p className="text-xl font-bold text-[#1E293B] mt-1.5">{formatNumber(stats.executions)}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Successful</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1.5">{formatNumber(stats.successful)}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-red-600">
            <span>Failed / Dropped</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-red-700 mt-1.5">{stats.failed}</p>
        </Card>
      </div>

      {/* Automations Table */}
      <DataTable
        columns={columns}
        data={automations}
        isLoading={isLoading}
        searchPlaceholder="Search automation name, keyword..."
        searchValue={search}
        onSearchChange={setSearch}
        onRowClick={(row) => router.push(`/automations/${row.id}`)}
        exportFilename="automations_catalog"
        filters={
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <FilterDropdown
              label="Trigger"
              value={triggerType}
              onChange={setTriggerType}
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
