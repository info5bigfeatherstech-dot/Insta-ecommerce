"use client";

import * as React from "react";
import Link from "next/link";
import { useReels, useAssignAutomationToReel } from "@/hooks/use-reels";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNumber, formatDate, generateSVGPlaceholder } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Instagram } from "@/components/shared/icons";
import {
  Film,
  Zap,
  List,
  LayoutGrid,
  ExternalLink,
  Eye,
  MessageSquare,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { db } from "@/data/db";

export default function ReelsPage() {
  const [viewMode, setViewMode] = React.useState("grid"); // "grid" | "table"
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [selectedReel, setSelectedReel] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [assignedAutomationId, setAssignedAutomationId] = React.useState("");

  const { data: reels = [], isLoading } = useReels({ search, filter });
  const assignMutation = useAssignAutomationToReel();

  const handleOpenDetail = (reel) => {
    setSelectedReel(reel);
    setAssignedAutomationId(reel.automationId || "none");
    setDetailOpen(true);
  };

  const handleAssignAutomation = async (autoId) => {
    if (!selectedReel) return;
    const targetId = autoId === "none" ? null : autoId;
    setAssignedAutomationId(autoId);
    await assignMutation.mutateAsync({ reelId: selectedReel.id, automationId: targetId });
    // Update local drawer state
    const matchedAuto = db.state.automations.find((a) => a.id === targetId);
    setSelectedReel((prev) => ({
      ...prev,
      automationId: targetId,
      automation: matchedAuto || null,
      status: targetId ? "active" : "unassigned",
    }));
  };

  const automationsList = db.state.automations;

  const columns = [
    {
      key: "caption",
      label: "Reel / Post",
      render: (_, row) => {
        const placeholder = generateSVGPlaceholder({
          text: row.caption,
          type: "reel",
          identifier: row.id,
        });
        return (
          <div className="flex items-center gap-3">
            <img
              src={placeholder}
              alt={row.caption}
              className="h-12 w-9 rounded-[6px] object-cover shrink-0 border border-[#E2E8F0]"
            />
            <div>
              <span className="font-semibold text-xs text-[#1E293B] line-clamp-1 block hover:text-[#635BDB]">
                {row.caption}
              </span>
              <span className="text-[10px] text-[#64748B]">Post ID: {row.instagramPostId}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "product",
      label: "Linked Product",
      render: (prod) => (
        <span className="text-xs font-medium text-[#1E293B]">{prod?.name || "—"}</span>
      ),
    },
    {
      key: "automation",
      label: "Active Automation",
      render: (auto) => (
        auto ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BDB] bg-[#EEF2FF] px-2 py-0.5 rounded-[6px]">
            <Zap className="h-3 w-3" />
            {auto.name}
          </span>
        ) : (
          <span className="text-xs text-[#94A3B8]">No automation assigned</span>
        )
      ),
    },
    {
      key: "triggerCount",
      label: "Triggers",
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-[#1E293B]">{formatNumber(val)}</span>,
    },
    {
      key: "dmsSent",
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
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetail(row);
          }}
          className="h-7 px-2.5 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Details</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reels & Posts"
        description="Monitor keyword triggers across published Instagram Reels and assign automated DM conversion flows."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected: {SITE_CONFIG.instagramHandle}</span>
          </div>
        }
      >
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-[8px] border border-[#E2E8F0]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={`h-7 w-7 rounded-[6px] ${
              viewMode === "grid" ? "bg-white text-[#1E293B] shadow-xs" : "text-[#64748B]"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("table")}
            className={`h-7 w-7 rounded-[6px] ${
              viewMode === "table" ? "bg-white text-[#1E293B] shadow-xs" : "text-[#64748B]"
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Grid or Table View */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Filter"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: "All Reels & Posts" },
                  { value: "active", label: "Active Automations" },
                  { value: "inactive", label: "Inactive Automations" },
                  { value: "unassigned", label: "No Automation Assigned" },
                ]}
              />
            </div>
            <p className="text-xs text-[#64748B]">Showing {reels.length} Reels</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reels.map((reel) => {
              const placeholder = generateSVGPlaceholder({
                text: reel.caption,
                type: "reel",
                identifier: reel.id,
              });

              return (
                <Card
                  key={reel.id}
                  onClick={() => handleOpenDetail(reel)}
                  className="cursor-pointer hover:shadow-md transition-all group overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/5] w-full bg-[#1E293B] overflow-hidden flex items-center justify-center">
                      <img
                        src={placeholder}
                        alt={reel.caption}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Instagram className="h-3 w-3" />
                        <span>{reel.instagramPostId}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={reel.status} />
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <p className="text-xs font-semibold text-[#1E293B] line-clamp-2 leading-relaxed">
                        {reel.caption}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-[#64748B] font-medium">{reel.product?.name}</span>
                        <span className="text-[#94A3B8]">{formatDate(reel.publishedDate, "dd MMM")}</span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#E2E8F0] mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-[#F8FAFC] rounded-[8px] my-2">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Triggers</span>
                        <span className="font-bold text-[#1E293B]">{formatNumber(reel.triggerCount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Clicks</span>
                        <span className="font-bold text-[#635BDB]">{formatNumber(reel.linkClicks)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Orders</span>
                        <span className="font-bold text-emerald-600">{reel.conversions}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {reel.automation ? (
                        <span className="text-[11px] font-semibold text-[#635BDB] truncate max-w-[170px] flex items-center gap-1">
                          <Zap className="h-3 w-3 shrink-0" />
                          <span className="truncate">{reel.automation.name}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">Unassigned</span>
                      )}

                      <span className="text-xs font-semibold text-[#635BDB] group-hover:underline flex items-center gap-0.5">
                        <span>Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={reels}
          isLoading={isLoading}
          searchPlaceholder="Search Reel caption, post ID..."
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={handleOpenDetail}
          exportFilename="instagram_reels"
          filters={
            <FilterDropdown
              label="Automation Status"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All Reels & Posts" },
                { value: "active", label: "Active Automations" },
                { value: "inactive", label: "Inactive Automations" },
                { value: "unassigned", label: "No Automation Assigned" },
              ]}
            />
          }
        />
      )}

      {/* Reel Details Drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md lg:max-w-lg flex flex-col justify-between">
          {selectedReel && (
            <>
              <SheetHeader className="p-5 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <SheetTitle className="text-base font-bold text-[#1E293B]">
                      Reel Details
                    </SheetTitle>
                    <SheetDescription>
                      Instagram Post ID: {selectedReel.instagramPostId} • Published {formatDate(selectedReel.publishedDate)}
                    </SheetDescription>
                  </div>
                  <StatusBadge status={selectedReel.status} />
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Large Thumbnail Preview */}
                <div className="rounded-[10px] overflow-hidden border border-[#E2E8F0] aspect-[16/9] w-full bg-[#1E293B] flex items-center justify-center relative">
                  <img
                    src={generateSVGPlaceholder({
                      text: selectedReel.caption,
                      type: "reel",
                      identifier: selectedReel.id,
                    })}
                    alt={selectedReel.caption}
                    className="h-full w-full object-cover"
                  />
                  <a
                    href={selectedReel.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#1E293B] hover:text-[#635BDB] px-3 py-1.5 rounded-[6px] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>View on Instagram</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Caption */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Caption & Hook
                  </h4>
                  <p className="text-xs text-[#1E293B] leading-relaxed p-3.5 rounded-[10px] border border-[#E2E8F0] bg-white">
                    {selectedReel.caption}
                  </p>
                </div>

                {/* Automation Assignment Control */}
                <div className="p-4 rounded-[10px] bg-[#EEF2FF]/60 border border-[#C7D2FE]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#635BDB] flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      <span>Assign Automation</span>
                    </span>
                  </div>

                  <Select
                    value={assignedAutomationId}
                    onValueChange={handleAssignAutomation}
                    disabled={assignMutation.isPending}
                  >
                    <SelectTrigger className="h-9 bg-white text-xs">
                      <SelectValue placeholder="Select an automation workflow..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No automation assigned (Disabled)</SelectItem>
                      {automationsList.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <p className="text-[10px] text-[#64748B]">
                    Selecting an automation dynamically binds this Reel's comments to trigger the automated DM flow.
                  </p>
                </div>

                {/* Performance Totals */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Attributed Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Total Keyword Triggers</span>
                      <span className="text-base font-bold text-[#1E293B]">
                        {formatNumber(selectedReel.triggerCount)}
                      </span>
                    </div>
                    <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Direct Messages Sent</span>
                      <span className="text-base font-bold text-[#1E293B]">
                        {formatNumber(selectedReel.dmsSent)}
                      </span>
                    </div>
                    <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Store Link Clicks</span>
                      <span className="text-base font-bold text-[#635BDB]">
                        {formatNumber(selectedReel.linkClicks)}
                      </span>
                    </div>
                    <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Completed Orders</span>
                      <span className="text-base font-bold text-emerald-600">
                        {selectedReel.conversions} orders
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked Product */}
                {selectedReel.product && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Featured Product
                    </h4>
                    <div className="p-3 rounded-[10px] border border-[#E2E8F0] bg-white flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#1E293B]">{selectedReel.product.name}</p>
                        <p className="text-[10px] text-[#64748B]">SKU: {selectedReel.product.sku}</p>
                      </div>
                      <Link
                        href={`/products`}
                        className="text-xs font-medium text-[#635BDB] hover:underline"
                      >
                        View in Catalog
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="p-4 border-t border-[#E2E8F0]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailOpen(false)}
                  className="w-full text-xs"
                >
                  Close Drawer
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
