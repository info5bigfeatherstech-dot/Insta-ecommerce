"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { cn } from "@/lib/utils";

export function ActivityChart({ data = [] }) {
  const [range, setRange] = React.useState("14d");
  const chartTheme = useChartTheme();

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle>Engagement & Conversion Overview</CardTitle>
          <CardDescription>
            Contacts acquired, DM messages sent, and trackable link clicks
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 mt-2 sm:mt-0 bg-secondary p-0.5 rounded-[8px]">
          {["7d", "14d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-[6px] font-medium transition-colors cursor-pointer",
                range === r
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.resolved.grid} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: chartTheme.resolved.text }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: chartTheme.resolved.text }}
              />
              <Tooltip
                contentStyle={chartTheme.tooltipContentStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px", color: chartTheme.resolved.text }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="messages"
                name="Messages Sent"
                stroke={chartTheme.resolved.chart1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                name="Link Clicks"
                stroke={chartTheme.resolved.chart2}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="contacts"
                name="New Contacts"
                stroke={chartTheme.resolved.chart3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
