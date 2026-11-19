import * as React from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Zap, ShoppingBag, MousePointerClick, MessageSquare, ArrowRight } from "lucide-react";

export function RecentActivity({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="h-3.5 w-3.5 text-success" />;
      case "dm_trigger":
        return <Zap className="h-3.5 w-3.5 text-primary" />;
      case "link_click":
        return <MousePointerClick className="h-3.5 w-3.5 text-info" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5 text-warning" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Customer Activity</CardTitle>
          <CardDescription>Live Instagram DM touchpoints & orders</CardDescription>
        </div>
        <Link
          href="/inbox"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View Inbox</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-border p-5 pt-0">
        {activities.map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <Link
                  href={`/customers/${item.customer.id}`}
                  className="text-xs font-semibold text-foreground hover:text-primary truncate"
                >
                  {item.customer.name}
                  <span className="text-muted-foreground font-normal ml-1">
                    ({item.customer.username})
                  </span>
                </Link>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{item.activity}</p>
              {item.product && (
                <Link
                  href={`/products/${item.product.id}`}
                  className="inline-block text-[10px] bg-primary-soft text-primary hover:underline px-1.5 py-0.2 rounded mt-1 font-medium"
                >
                  {item.product.name}
                </Link>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
