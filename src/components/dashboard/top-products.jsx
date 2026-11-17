import * as React from "react";
import Link from "next/link";
import { formatINR, formatNumber, generateSVGPlaceholder } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function TopProducts({ products = [] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Top DM-Driven Products</CardTitle>
          <CardDescription>Highest revenue generated from automation links</CardDescription>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-[#635BDB] hover:underline flex items-center gap-1"
        >
          <span>All Products</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-[#E2E8F0] p-5 pt-0">
        {products.map((prod) => {
          const placeholder = generateSVGPlaceholder({
            text: prod.name,
            type: "product",
            identifier: prod.id,
          });

          return (
            <Link
              key={prod.id}
              href={`/products/${prod.id}`}
              className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 group block hover:bg-[#F8FAFC] -mx-2 px-2 rounded-[6px] transition-colors"
            >
              <img
                src={placeholder}
                alt={prod.name}
                className="h-10 w-10 rounded-[8px] object-cover shrink-0 border border-[#E2E8F0]"
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1E293B] group-hover:text-[#635BDB] truncate transition-colors">
                  {prod.name}
                </p>
                <p className="text-[10px] text-[#64748B]">{prod.category} • {formatINR(prod.price)}</p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="text-right">
                  <span className="font-bold text-[#1E293B] block">
                    {formatNumber(prod.orders)}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">orders</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#635BDB] block">
                    {formatNumber(prod.linkClicks)}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">clicks</span>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
