"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
            <Image
              src={placeholder}
              alt={row.caption}
              width={36}
              height={48}
              unoptimized
              className="h-12 w-9 rounded-[6px] object-cover shrink-0 border border-border"
            />
            <div>
              <span className="font-semibold text-xs text-foreground line-clamp-1 block hover:text-primary">
                {row.caption}
              </span>
              <span className="text-[10px] text-muted-foreground">Post ID: {row.instagramPostId}</span>
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
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary border border-primary/30"
              >
                Comment: {kw}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning-soft border border-warning/30 px-2 py-0.5 rounded">
              <AlertTriangle className="h-3 w-3 text-warning" />
              No keyword set
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(row, "trigger");
              }}
              className="h-6 px-2 text-[10px] font-bold text-primary border-primary/40 hover:bg-primary-soft"
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
        <span className="text-xs font-medium text-foreground">{prod?.name || "—"}</span>
      ),
    },
    {
      key: "triggerCount",
      label: "Triggers",
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-foreground">{formatNumber(val)}</span>,
    },
    {
      key: "dmsSent",
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
            className="h-7 px-2 text-xs text-success hover:bg-success-soft gap-1 font-semibold"
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
            className="h-7 px-2 text-xs text-primary hover:bg-primary-soft gap-1 font-semibold"
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
        <div className="flex items-center bg-muted p-0.5 rounded-[8px] border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReelsFilter({ viewMode: "grid" })}
            className={`h-7 w-7 rounded-[6px] ${
              viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
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
              viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-[12px] border border-border">
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
            <p className="text-xs text-muted-foreground">Showing {reels.length} Reels</p>
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
                    <div className="relative aspect-[4/5] w-full bg-muted overflow-hidden flex items-center justify-center">
                      <Image
                        src={placeholder}
                        alt={reel.caption}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-foreground/80 backdrop-blur-xs text-background text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Instagram className="h-3 w-3" />
                        <span>{reel.instagramPostId}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={reel.status} />
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                        {reel.caption}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-muted-foreground font-medium">{reel.product?.name}</span>
                        <span className="text-muted-foreground">{formatDate(reel.publishedDate, "dd MMM")}</span>
                      </div>

                      {/* Trigger Keywords Chips or Warning */}
                      <div className="pt-2 border-t border-border/60">
                        {hasKeywords ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {reel.triggerKeywords.slice(0, 3).map((kw) => (
                              <span
                                key={kw}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary border border-primary/30"
                              >
                                Comment: {kw}
                              </span>
                            ))}
                            {reel.triggerKeywords.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{reel.triggerKeywords.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning-soft border border-warning/30 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="h-3 w-3 text-warning" />
                              No keyword set
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(reel, "trigger");
                              }}
                              className="h-6 px-2 text-[10px] font-bold text-primary border-primary/40 hover:bg-primary-soft"
                            >
                              Set keyword
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 border-t border-border mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-muted/40 rounded-[8px] my-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Triggers</span>
                        <span className="font-bold text-foreground">{formatNumber(reel.triggerCount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Clicks</span>
                        <span className="font-bold text-primary">{formatNumber(reel.linkClicks)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Orders</span>
                        <span className="font-bold text-success">{reel.conversions}</span>
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
                        className="h-6 px-2 text-[11px] text-success hover:bg-success-soft font-semibold gap-1 p-0"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>Test Simulator</span>
                      </Button>

                      <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-0.5">
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
