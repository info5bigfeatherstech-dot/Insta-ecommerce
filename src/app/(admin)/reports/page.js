"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Zap,
  Users,
  Package,
  Film,
  Send,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const REPORT_DEFINITIONS = [
  { id: "automation_performance", title: "Automation Performance", icon: Zap, desc: "Triggers, delivery rates, CTR and direct conversions" },
  { id: "customer_growth", title: "Customer Growth", icon: Users, desc: "Touchpoint sources, message volume, and buyer status" },
  { id: "product_performance", title: "Product Performance", icon: Package, desc: "DM product clicks vs actual orders and inventory remaining" },
  { id: "reel_performance", title: "Reel Performance", icon: Film, desc: "Instagram video reach, comment volume, and keyword conversion rate" },
  { id: "dm_delivery", title: "DM Delivery Logs", icon: Send, desc: "API throughput, delivery SLA status, and read receipts" },
  { id: "revenue_attribution", title: "Revenue Attribution", icon: IndianRupee, desc: "Order amounts, payment methods, and attribution timeline" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState("automation_performance");
  const [dateRange, setDateRange] = React.useState("30d");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", selectedReport, dateRange],
    queryFn: () => reportsService.getReportData(selectedReport, dateRange).then((res) => res.data),
  });

  const handleDownloadReport = () => {
    toast.success(`Download Report (${reportData?.title || "Report"}) generated! (Simulated download complete)`);
  };

  const activeDef = REPORT_DEFINITIONS.find((r) => r.id === selectedReport) || REPORT_DEFINITIONS[0];

  return (
    <div className="space-y-6 ">
      <PageHeader
        title="Custom Reports & Auditing"
        description="Comprehensive audit exports covering marketing funnels, delivery performance, and revenue attribution."
      >
        <div className="flex items-center gap-2">
          {/* Simulated Download Button */}
          <Button
            size="sm"
            onClick={handleDownloadReport}
            className="gap-1.5 shadow-sm text-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF / XLSX</span>
          </Button>
        </div>
      </PageHeader>

      {/* Six Report Switcher Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {REPORT_DEFINITIONS.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-3.5 rounded-[12px] border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "bg-white border-[#635BDB] ring-2 ring-[#635BDB]/20 shadow-sm"
                  : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-[8px] mb-2 ${
                  isSelected ? "bg-[#635BDB] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h4
                  className={`text-xs font-bold ${
                    isSelected ? "text-[#635BDB]" : "text-[#1E293B]"
                  }`}
                >
                  {rep.title}
                </h4>
                <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-2 leading-tight">
                  {rep.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Preview & Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{reportData?.title || activeDef.title}</CardTitle>
              <span className="text-[10px] font-bold bg-[#EEF2FF] text-[#635BDB] px-2 py-0.5 rounded-full">
                Live Data Preview
              </span>
            </div>
            <CardDescription className="mt-1">
              {reportData?.description || activeDef.desc}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            {/* Date range filter */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-[8px] border border-[#E2E8F0]">
              {["7d", "30d", "90d", "All Time"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  className={`px-2.5 py-1 text-xs rounded-[6px] font-medium transition-colors ${
                    dateRange === d
                      ? "bg-white text-[#1E293B] shadow-xs"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {isLoading ? (
            <LoadingState text="Compiling dataset..." />
          ) : (
            <DataTable
              columns={reportData?.columns || []}
              data={reportData?.rows || []}
              isLoading={false}
              exportFilename={`${selectedReport}_report`}
              searchable={true}
              searchPlaceholder="Filter report records..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
