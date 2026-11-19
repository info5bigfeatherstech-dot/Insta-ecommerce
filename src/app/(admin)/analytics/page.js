"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR, formatNumber } from "@/lib/utils";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const [range, setRange] = React.useState("30d");
  const chartTheme = useChartTheme();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => analyticsService.getAnalytics(range).then((res) => res.data),
  });

  if (isLoading || !analytics) {
    return <LoadingState text="Calculating Instagram audience conversion metrics..." />;
  }

  const { stats, charts, tables } = analytics;

  const pieColors = [
    chartTheme.resolved.chart1,
    chartTheme.resolved.chart2,
    chartTheme.resolved.chart3,
    chartTheme.resolved.chart4,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & DM Funnel Performance"
        description="Comprehensive insights across message delivery, audience growth, product demand, and Instagram revenue."
      >
        {/* Date Filter: Today, 7d, 30d, 90d, Custom */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-[10px] border border-border shadow-xs">
          {[
            { id: "today", label: "Today" },
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "90d", label: "90 Days" },
            { id: "custom", label: "Custom Range" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-[6px] font-semibold transition-colors cursor-pointer",
                range === item.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* 7 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3.5 border-border">
          <span className="text-[11px] text-muted-foreground block truncate">Total Contacts</span>
          <p className="text-lg font-bold text-foreground mt-1">{formatNumber(stats.totalContacts)}</p>
        </Card>
        <Card className="p-3.5 border-border">
          <span className="text-[11px] text-muted-foreground block truncate">Automation Triggers</span>
          <p className="text-lg font-bold text-primary mt-1">{formatNumber(stats.automationTriggers)}</p>
        </Card>
        <Card className="p-3.5 border-border">
          <span className="text-[11px] text-muted-foreground block truncate">Messages Sent</span>
          <p className="text-lg font-bold text-foreground mt-1">{formatNumber(stats.messagesSent)}</p>
        </Card>
        <Card className="p-3.5 border-border">
          <span className="text-[11px] text-muted-foreground block truncate">Delivered</span>
          <p className="text-lg font-bold text-success mt-1">{formatNumber(stats.messagesDelivered)}</p>
        </Card>
        <Card className="p-3.5 border-border">
          <span className="text-[11px] text-muted-foreground block truncate">Link Clicks</span>
          <p className="text-lg font-bold text-info mt-1">{formatNumber(stats.linkClicks)}</p>
        </Card>
        <Card className="p-3.5 border-border">
          <span className="text-[11px] text-muted-foreground block truncate">Attributed Orders</span>
          <p className="text-lg font-bold text-warning mt-1">{stats.orders}</p>
        </Card>
        <Card className="p-3.5 border-primary/30 bg-primary-soft">
          <span className="text-[11px] text-primary font-semibold block truncate">Total Revenue</span>
          <p className="text-lg font-bold text-primary mt-1">{formatINR(stats.attributedRevenue)}</p>
        </Card>
      </div>

      {/* Chart Row 1: Contact Growth & Messages Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Growth */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Audience Acquisition Growth</CardTitle>
            <CardDescription>Daily vs cumulative contact capture across touchpoints</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.contactGrowthChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.resolved.grid} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartTheme.resolved.text }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartTheme.resolved.text }} />
                  <Tooltip
                    contentStyle={chartTheme.tooltipContentStyle}
                    itemStyle={chartTheme.tooltipItemStyle}
                    labelStyle={chartTheme.tooltipLabelStyle}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: chartTheme.resolved.text }} />
                  <Line type="monotone" dataKey="cumulative" name="Cumulative Contacts" stroke={chartTheme.resolved.chart1} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="contacts" name="Daily Contacts" stroke={chartTheme.resolved.chart3} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Messages Over Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Message Dispatch Volume & Delivery Rate</CardTitle>
            <CardDescription>Sent versus successfully delivered automated DMs</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.messagesOverTimeChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.resolved.grid} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartTheme.resolved.text }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartTheme.resolved.text }} />
                  <Tooltip
                    contentStyle={chartTheme.tooltipContentStyle}
                    itemStyle={chartTheme.tooltipItemStyle}
                    labelStyle={chartTheme.tooltipLabelStyle}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: chartTheme.resolved.text }} />
                  <Bar dataKey="sent" name="Messages Dispatched" fill={chartTheme.resolved.chart2} stroke={chartTheme.resolved.chart1} strokeWidth={1} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" name="Delivered Successfully" fill={chartTheme.resolved.chart1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Row 2: Product Performance Bar & Traffic Sources Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Performance Bar Chart (2 cols) */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Product Demand: DMs Sent vs Completed Orders</CardTitle>
            <CardDescription>Conversion correlation per advertised catalog item</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.productPerformanceChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.resolved.grid} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: chartTheme.resolved.text }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chartTheme.resolved.text }} />
                  <Tooltip
                    contentStyle={chartTheme.tooltipContentStyle}
                    itemStyle={chartTheme.tooltipItemStyle}
                    labelStyle={chartTheme.tooltipLabelStyle}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: chartTheme.resolved.text }} />
                  <Bar dataKey="messages" name="DMs Delivered" fill={chartTheme.resolved.chart2} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" name="Link Clicks" fill={chartTheme.resolved.chart1} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" name="Orders Placed" fill={chartTheme.resolved.chart3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources Breakdown Pie Chart (1 col) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Trigger Traffic Share</CardTitle>
            <CardDescription>Distribution across trigger types</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center">
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.trafficSources}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTheme.tooltipContentStyle}
                    itemStyle={chartTheme.tooltipItemStyle}
                    labelStyle={chartTheme.tooltipLabelStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-1.5 pt-2 border-t border-border text-xs">
              {charts.trafficSources.map((src, index) => (
                <div key={src.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                    <span className="text-muted-foreground text-[11px] truncate max-w-[150px]">{src.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{src.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row: Top Automations, Top Products, Top Reels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Automations Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Automations by CTR</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-y border-border text-muted-foreground">
                  <tr>
                    <th className="py-2 px-3">Flow</th>
                    <th className="py-2 px-2 text-right">Triggers</th>
                    <th className="py-2 px-3 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tables.topAutomations.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/50">
                      <td className="py-2.5 px-3 font-semibold text-foreground truncate max-w-[120px]">{a.name}</td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground">{formatNumber(a.triggers)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-primary">{a.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-y border-border text-muted-foreground">
                  <tr>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-2 text-right">Orders</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tables.topProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/50">
                      <td className="py-2.5 px-3 font-semibold text-foreground truncate max-w-[120px]">{p.name}</td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground">{p.orders}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-success">{formatINR(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Reels Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Reels by Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-y border-border text-muted-foreground">
                  <tr>
                    <th className="py-2 px-3">Reel Post</th>
                    <th className="py-2 px-2 text-right">Clicks</th>
                    <th className="py-2 px-3 text-right">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tables.topReels.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/50">
                      <td className="py-2.5 px-3 font-semibold text-foreground truncate max-w-[120px]">{r.caption}</td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground">{formatNumber(r.clicks)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-success">{r.conversionRate}</td>
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
