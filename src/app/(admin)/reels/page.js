"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReels } from "@/hooks/use-reels";
import { useListFilterStore } from "@/store/list-filter-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNumber, formatDate, generateSVGPlaceholder } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram } from "@/components/shared/icons";
import {
  Film,
  Zap,
  List,
  LayoutGrid,
  ExternalLink,
  Eye,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";

export default function ReelsPage() {
  const router = useRouter();

  // Persistent list filter state
  const { reels: filterState, setReelsFilter } = useListFilterStore();
  const { search, filter, viewMode } = filterState;

  const { data: reels = [], isLoading } = useReels({ search, filter });

  const handleNavigate = (reel, tab = "overview") => {
    router.push(`/reels/${reel.id}${tab ? `?tab=${tab}` : ""}`);
  };

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
      key: "triggerKeywords",
      label: "Comment Trigger",
      render: (_, row) => {
        const hasKeywords = row.triggerKeywords && row.triggerKeywords.length > 0;
        return hasKeywords ? (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.triggerKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#635BDB] border border-[#C7D2FE]/60"
              >
                Comment: {kw}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              No keyword set
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(row, "trigger");
              }}
              className="h-6 px-2 text-[10px] font-bold text-[#635BDB] border-[#C7D2FE] hover:bg-[#EEF2FF]"
            >
              Set keyword
            </Button>
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
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate(row, "simulator");
            }}
            className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50 gap-1 font-semibold"
            title="Test trigger in simulator"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Test</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate(row, "trigger");
            }}
            className="h-7 px-2 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1 font-semibold"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reels & Posts"
        description="Configure comment trigger keywords per Reel to automate personalized DM responses and store link conversions."
      >
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-[8px] border border-[#E2E8F0]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReelsFilter({ viewMode: "grid" })}
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
            onClick={() => setReelsFilter({ viewMode: "table" })}
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
                onChange={(val) => setReelsFilter({ filter: val })}
                options={[
                  { value: "all", label: "All Reels & Posts" },
                  { value: "active", label: "Active Automations" },
                  { value: "inactive", label: "Inactive Automations" },
                  { value: "unassigned", label: "No Keyword Set (Unassigned)" },
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

              const hasKeywords = reel.triggerKeywords && reel.triggerKeywords.length > 0;

              return (
                <Card
                  key={reel.id}
                  onClick={() => handleNavigate(reel, "overview")}
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

                      {/* Trigger Keywords Chips or Warning */}
                      <div className="pt-2 border-t border-[#F1F5F9]">
                        {hasKeywords ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {reel.triggerKeywords.slice(0, 3).map((kw) => (
                              <span
                                key={kw}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#635BDB] border border-[#C7D2FE]/60"
                              >
                                Comment: {kw}
                              </span>
                            ))}
                            {reel.triggerKeywords.length > 3 && (
                              <span className="text-[10px] text-[#94A3B8]">
                                +{reel.triggerKeywords.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              No keyword set
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(reel, "trigger");
                              }}
                              className="h-6 px-2 text-[10px] font-bold text-[#635BDB] border-[#C7D2FE] hover:bg-[#EEF2FF]"
                            >
                              Set keyword
                            </Button>
                          </div>
                        )}
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(reel, "simulator");
                        }}
                        className="h-6 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 font-semibold gap-1 p-0"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>Test Simulator</span>
                      </Button>

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
          searchPlaceholder="Search Reel caption, post ID, keywords..."
          searchValue={search}
          onSearchChange={(val) => setReelsFilter({ search: val })}
          onRowClick={(row) => handleNavigate(row, "overview")}
          exportFilename="instagram_reels_automations"
          filters={
            <FilterDropdown
              label="Automation Status"
              value={filter}
              onChange={(val) => setReelsFilter({ filter: val })}
              options={[
                { value: "all", label: "All Reels & Posts" },
                { value: "active", label: "Active Automations" },
                { value: "inactive", label: "Inactive Automations" },
                { value: "unassigned", label: "No Keyword Set (Unassigned)" },
              ]}
            />
          }
        />
      )}
    </div>
  );
}
