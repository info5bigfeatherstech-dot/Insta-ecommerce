import * as React from "react";
import {
  Users,
  UserPlus,
  Send,
  MousePointerClick,
  Zap,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

const ICONS = {
  Users,
  UserPlus,
  Send,
  MousePointerClick,
  Zap,
  ShoppingCart,
};

export function StatCard({ stat }) {
  const Icon = ICONS[stat.icon] || Users;
  const isUp = stat.trend === "up";

  return (
    <Card className="hover:shadow-[0_2px_8px_-2px_rgb(0_0_0/0.06)] transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-tight">
            {stat.title}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            {formatNumber(stat.value)}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              isUp ? "text-success" : "text-destructive"
            }`}
          >
            {isUp ? (
              <TrendingUp className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <TrendingDown className="h-3 w-3 stroke-[2.5]" />
            )}
            {stat.change}
          </span>
          <span className="text-muted-foreground truncate">{stat.comparison}</span>
        </div>
      </CardContent>
    </Card>
  );
}
