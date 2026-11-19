"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TopProducts } from "@/components/dashboard/top-products";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatINR, formatNumber, formatDate, generateSVGPlaceholder } from "@/lib/utils";
import { ArrowRight, Film, ExternalLink, Zap, Plus, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return <LoadingState text="Loading analytics and live metrics..." />;
  }

  const {
    stats,
    engagementChart,
    automationPerformance,
    recentActivity,
    topReels,
    topProducts,
    recentOrders,
  } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        description="Real-time performance across Instagram automation triggers, DM conversations, and attributed store sales."
      >
        <Button asChild size="sm" className="gap-1.5 shadow-sm">
          <Link href="/automations/create">
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Six Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Primary Analytics & Live Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityChart data={engagementChart} />
        <RecentActivity activities={recentActivity} />
      </div>

      {/* Automation Performance Table & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Automation Performance</CardTitle>
              <CardDescription>
                Live trigger rates and delivery success for active workflows
              </CardDescription>
            </div>
            <Link
              href="/automations"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Automation Name</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Triggers</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Delivered</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Clicks</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Success</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {automationPerformance.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <Link href={`/automations/${item.id}`} className="hover:text-primary">
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-foreground">
                        {formatNumber(item.triggers)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-foreground">
                        {formatNumber(item.delivered)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-primary">
                        {formatNumber(item.clicks)}
                      </td>
                      <td className="py-3 px-3 text-right text-success font-semibold">
                        {item.successRate}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <TopProducts products={topProducts} />
      </div>

      {/* Top Performing Reels & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Reels */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Top Performing Reels</CardTitle>
              <CardDescription>Organic video reach driving keyword automations</CardDescription>
            </div>
            <Link
              href="/reels"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>All Reels</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border p-5 pt-0">
            {topReels.map((reel) => {
              const placeholder = generateSVGPlaceholder({
                text: reel.caption,
                type: "reel",
                identifier: reel.id,
              });

              return (
                <Link
                  key={reel.id}
                  href={`/reels/${reel.id}`}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group block hover:bg-muted/50 -mx-2 px-2 rounded-[6px] transition-colors"
                >
                  <Image
                    src={placeholder}
                    alt={reel.caption}
                    width={44}
                    height={56}
                    unoptimized
                    className="h-14 w-11 rounded-[6px] object-cover shrink-0 border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary line-clamp-2 transition-colors">
                      {reel.caption}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span>{reel.productName}</span>
                      <span>•</span>
                      <span className="text-primary font-medium">{reel.automationName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-foreground block">
                      {formatNumber(reel.clicks)} clicks
                    </span>
                    <span className="text-[10px] text-success font-semibold block">
                      {reel.conversions} orders
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Attributed Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Orders with direct Instagram attribution</CardDescription>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Order</th>
                    <th className="py-2.5 px-3 font-semibold">Customer</th>
                    <th className="py-2.5 px-3 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <Link href={`/orders/${ord.id}`} className="hover:text-primary font-semibold">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/customers/${ord.customerId || 'cust_1'}`}
                          className="font-medium text-foreground hover:text-primary block truncate max-w-[120px]"
                        >
                          {ord.customerName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {ord.instagramUsername}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {formatINR(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={ord.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
