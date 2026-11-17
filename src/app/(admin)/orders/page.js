"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/use-orders";
import { useListFilterStore } from "@/store/list-filter-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { formatINR, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();

  // Retrieve persistent list filter state from store
  const { orders: filterState, setOrdersFilter } = useListFilterStore();
  const { search, status, paymentMethod, page } = filterState;

  const { data, isLoading } = useOrders({
    search,
    status,
    paymentMethod,
    page,
    limit: 10,
  });

  const handleRowClick = (order) => {
    router.push(`/orders/${order.id}`);
  };

  const stats = data?.stats || {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  const columns = [
    {
      key: "orderNumber",
      label: "Order ID",
      sortable: true,
      render: (val, row) => (
        <Link
          href={`/orders/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-xs text-[#1E293B] hover:text-[#635BDB] hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-medium text-xs text-[#1E293B] block">{val}</span>
          <span className="text-[10px] text-[#64748B] block">{row.instagramUsername}</span>
        </div>
      ),
    },
    {
      key: "items",
      label: "Products",
      render: (items) => {
        if (!items || !items.length) return "—";
        return (
          <div className="max-w-[180px] truncate text-xs" title={items.map((i) => i.productName).join(", ")}>
            <span>{items[0].productName}</span>
            {items.length > 1 && (
              <span className="text-[10px] text-[#635BDB] ml-1 font-semibold">
                +{items.length - 1} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (val) => <span className="text-xs text-[#64748B]">{formatDate(val, "dd MMM yyyy")}</span>,
    },
    {
      key: "totalAmount",
      label: "Amount",
      sortable: true,
      render: (val) => <span className="font-semibold text-xs text-[#1E293B]">{formatINR(val)}</span>,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "fulfillmentStatus",
      label: "Fulfillment",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-7 px-2.5 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1"
          >
            <Link href={`/orders/${row.id}`} onClick={(e) => e.stopPropagation()}>
              <Eye className="h-3.5 w-3.5" />
              <span>Details</span>
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Fulfillment tracking, payment status, and direct Instagram DM attribution."
      />

      {/* 6 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Orders</span>
            <ShoppingCart className="h-4 w-4 text-[#635BDB]" />
          </div>
          <p className="text-xl font-bold text-[#1E293B] mt-1.5">{stats.total}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-amber-600">
            <span>Pending</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-amber-700 mt-1.5">{stats.pending}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>Processing</span>
            <Package className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-blue-700 mt-1.5">{stats.processing}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-purple-600">
            <span>Shipped</span>
            <Truck className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-purple-700 mt-1.5">{stats.shipped}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Delivered</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1.5">{stats.delivered}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-rose-600">
            <span>Cancelled</span>
            <XCircle className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-rose-700 mt-1.5">{stats.cancelled}</p>
        </Card>
      </div>

      {/* Orders DataTable */}
      <DataTable
        columns={columns}
        data={data?.orders || []}
        isLoading={isLoading}
        searchPlaceholder="Search order ID, customer name, username, product..."
        searchValue={search}
        onSearchChange={(val) => setOrdersFilter({ search: val, page: 1 })}
        pagination={data?.pagination}
        onPageChange={(p) => setOrdersFilter({ page: p })}
        onRowClick={handleRowClick}
        exportFilename="orders_export"
        filters={
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Fulfillment"
              value={status}
              onChange={(val) => setOrdersFilter({ status: val, page: 1 })}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            <FilterDropdown
              label="Payment Method"
              value={paymentMethod}
              onChange={(val) => setOrdersFilter({ paymentMethod: val, page: 1 })}
              options={[
                { value: "all", label: "All Methods" },
                { value: "UPI", label: "UPI" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "Cash on Delivery", label: "Cash on Delivery" },
              ]}
            />
          </div>
        }
      />
    </div>
  );
}
