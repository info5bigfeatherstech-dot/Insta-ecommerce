"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, exportToCSV } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching your current filters or search.",
  emptyAction = null,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchValue = "",
  onSearchChange = null,
  filters = null, // Custom filter elements
  sortColumn = "",
  sortDirection = "desc",
  onSort = null,
  pagination = null, // { page, limit, totalRecords, totalPages, onPageChange }
  selectable = false,
  selectedRows = [],
  onSelectionChange = null,
  onRowClick = null,
  exportFilename = "export_data",
  className = "",
}) {
  const [localSearch, setLocalSearch] = React.useState(searchValue);

  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const isAllSelected =
    data.length > 0 && selectedRows.length === data.length;
  const isPartiallySelected =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row) => row.id || row));
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  const handleHeaderSort = (key, sortable) => {
    if (!sortable || !onSort) return;
    if (sortColumn === key) {
      onSort(key, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  };

  const handleExportCSV = () => {
    exportToCSV(exportFilename, data, columns);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Top Toolbar: Search, Filters, Export */}
      {(searchable || filters || exportFilename) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-1 items-center gap-2">
            {searchable && (
              <div className="relative w-full max-w-xs">
                <Input
                  placeholder={searchPlaceholder}
                  value={localSearch}
                  onChange={handleSearchInput}
                  className="h-8 text-xs bg-white"
                />
              </div>
            )}
            {filters}
          </div>

          <div className="flex items-center gap-2">
            {selectable && selectedRows.length > 0 && (
              <span className="text-xs text-[#635BDB] font-medium bg-[#EEF2FF] px-2.5 py-1 rounded-[6px]">
                {selectedRows.length} selected
              </span>
            )}
            {exportFilename && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 text-xs gap-1.5"
                title="Export current view to CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden shadow-[0_1px_3px_0_rgb(0_0_0/0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ fontSize: "var(--table-font-size, 0.875rem)" }}>
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {selectable && (
                  <th className="w-10 px-3 py-2.5 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const isCurrentSort = sortColumn === col.key;
                  return (
                    <th
                      key={col.key || col.label}
                      onClick={() => handleHeaderSort(col.key, col.sortable)}
                      style={{
                        paddingTop: "var(--table-py, 0.75rem)",
                        paddingBottom: "var(--table-py, 0.75rem)",
                        paddingLeft: "var(--table-px, 1rem)",
                        paddingRight: "var(--table-px, 1rem)",
                      }}
                      className={cn(
                        "font-semibold text-xs text-[#64748B] select-none whitespace-nowrap",
                        col.sortable && "cursor-pointer hover:text-[#1E293B]",
                        col.className
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable && (
                          <span className="text-[#94A3B8]">
                            {isCurrentSort ? (
                              sortDirection === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[#635BDB]" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5 text-[#635BDB]" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-60" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8">
                    <LoadingState text="Loading data..." />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-12">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const isSelected = selectedRows.includes(row.id);
                  return (
                    <tr
                      key={row.id || index}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={cn(
                        "transition-colors hover:bg-[#F8FAFC]",
                        onRowClick && "cursor-pointer",
                        isSelected && "bg-[#EEF2FF]/40"
                      )}
                    >
                      {selectable && (
                        <td
                          className="w-10 px-3 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectRow(row.id, { stopPropagation: () => {} })}
                            aria-label={`Select row ${row.id}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const cellVal = row[col.key];
                        return (
                          <td
                            key={col.key}
                            style={{
                              paddingTop: "var(--table-py, 0.75rem)",
                              paddingBottom: "var(--table-py, 0.75rem)",
                              paddingLeft: "var(--table-px, 1rem)",
                              paddingRight: "var(--table-px, 1rem)",
                            }}
                            className={cn("text-[#1E293B]", col.cellClassName)}
                          >
                            {col.render ? col.render(cellVal, row) : (cellVal ?? "—")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2E8F0] px-4 py-3 bg-[#F8FAFC]">
            <p className="text-xs text-[#64748B]">
              Showing <span className="font-medium text-[#1E293B]">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
              <span className="font-medium text-[#1E293B]">
                {Math.min(pagination.page * pagination.limit, pagination.totalRecords)}
              </span>{" "}
              of <span className="font-medium text-[#1E293B]">{pagination.totalRecords}</span> entries
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>

              <div className="flex items-center gap-1 px-1 text-xs text-[#1E293B]">
                Page <span className="font-semibold">{pagination.page}</span> of{" "}
                <span className="font-semibold">{pagination.totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
