"use client";

import * as React from "react";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ExecutionsTab({ executions = [], onSelectExecution }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // Filter executions
  const filtered = executions.filter((exec) => {
    const matchesStatus =
      statusFilter === "all" || exec.status === statusFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      exec.id.toLowerCase().includes(query) ||
      exec.triggerPayload?.username?.toLowerCase().includes(query) ||
      exec.triggerPayload?.commentText?.toLowerCase().includes(query) ||
      (exec.error && exec.error.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalRuns = executions.length;
  const successfulRuns = executions.filter((e) => e.status === "success").length;
  const failedRuns = executions.filter((e) => e.status === "failed").length;

  return (
    <div className="flex-1 bg-[#F8FAFC] p-4 sm:p-6 overflow-y-auto space-y-5">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[12px] bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
            Total Executions
          </span>
          <span className="text-2xl font-extrabold text-[#1E293B] mt-1 block">
            {formatNumber(totalRuns)}
          </span>
          <p className="text-[11px] text-[#64748B] mt-0.5">Recorded historical trigger runs</p>
        </div>

        <div className="p-4 rounded-[12px] bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Successful Runs
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {formatNumber(successfulRuns)}
          </span>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {totalRuns ? Math.round((successfulRuns / totalRuns) * 100) : 100}% delivery rate
          </p>
        </div>

        <div className="p-4 rounded-[12px] bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Failed Runs
          </span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
            {formatNumber(failedRuns)}
          </span>
          <p className="text-[11px] text-[#64748B] mt-0.5">Api rate-limits & expired windows</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white rounded-[12px] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search executions by user, id..."
            className="pl-9 h-8 text-xs bg-[#F8FAFC] border-[#E2E8F0]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <span className="text-xs text-[#64748B] font-medium mr-1">Status:</span>
          {["all", "success", "failed"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-[6px] text-xs font-semibold capitalize transition-colors",
                statusFilter === st
                  ? "bg-[#635BDB] text-white shadow-2xs"
                  : "bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B]"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Trigger / User</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Summary / Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    No executions found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((exec) => (
                  <tr
                    key={exec.id}
                    onClick={() => onSelectExecution(exec)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                          exec.status === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        )}
                      >
                        {exec.status === "success" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="capitalize">{exec.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-[#1E293B]">
                      {exec.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-[#1E293B]">
                        <User className="h-3 w-3 text-[#635BDB]" />
                        <span>{exec.triggerPayload?.username || "@user"}</span>
                        {exec.triggerPayload?.commentText && (
                          <span className="text-[10px] bg-[#EEF2FF] text-[#635BDB] px-1.5 py-0.2 rounded font-mono">
                            "{exec.triggerPayload.commentText}"
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {formatDate(exec.startedAt)}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#64748B]">
                      {exec.duration}ms
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-[#64748B]">
                      {exec.error ? (
                        <span className="text-rose-600 font-medium truncate block">
                          {exec.error}
                        </span>
                      ) : (
                        <span>Delivered automated DM & tags</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExecution(exec);
                        }}
                        className="h-7 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1 font-semibold"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect Run</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} runs
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-bold text-[#1E293B]">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 text-xs"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
