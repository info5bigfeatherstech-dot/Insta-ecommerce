"use client";

import * as React from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { formatINR, formatDate, generateSVGPlaceholder } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Instagram } from "@/components/shared/icons";
import {
  ShoppingCart,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  CreditCard,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [paymentMethod, setPaymentMethod] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { data, isLoading } = useOrders({
    search,
    status,
    paymentMethod,
    page,
    limit: 10,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate(
      { id: selectedOrder.id, status: newStatus },
      {
        onSuccess: (res) => {
          setSelectedOrder(res.data);
        },
      }
    );
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
        <span className="font-semibold text-xs text-[#1E293B] hover:text-[#635BDB]">
          {val}
        </span>
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
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail(row);
            }}
            className="h-7 px-2.5 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
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
          <div className="flex items-center justify-between text-xs text-indigo-600">
            <span>Shipped</span>
            <Truck className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-indigo-700 mt-1.5">{stats.shipped}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Delivered</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1.5">{stats.delivered}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-red-600">
            <span>Cancelled</span>
            <XCircle className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-red-700 mt-1.5">{stats.cancelled}</p>
        </Card>
      </div>

      {/* Orders DataTable */}
      <DataTable
        columns={columns}
        data={data?.orders || []}
        isLoading={isLoading}
        searchPlaceholder="Search order #, customer, username..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onRowClick={handleOpenDetail}
        exportFilename="orders_report"
        filters={
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Status"
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
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
              onChange={(val) => {
                setPaymentMethod(val);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Methods" },
                { value: "UPI", label: "UPI" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "Net Banking", label: "Net Banking" },
                { value: "Cash on Delivery", label: "COD" },
              ]}
            />
          </div>
        }
        pagination={{
          page: data?.pagination?.page || 1,
          limit: data?.pagination?.limit || 10,
          totalRecords: data?.pagination?.totalRecords || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Order Details Drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md lg:max-w-lg flex flex-col justify-between">
          {selectedOrder && (
            <>
              <SheetHeader className="p-5 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <SheetTitle className="text-base font-bold text-[#1E293B]">
                      {selectedOrder.orderNumber}
                    </SheetTitle>
                    <SheetDescription>
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </SheetDescription>
                  </div>
                  <StatusBadge status={selectedOrder.fulfillmentStatus} />
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Status Update Quick Select */}
                <div className="bg-[#EEF2FF]/60 p-3.5 rounded-[10px] border border-[#C7D2FE]/50 space-y-2">
                  <span className="text-xs font-bold text-[#635BDB] block">
                    Update Fulfillment Status
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedOrder.fulfillmentStatus}
                      onValueChange={handleStatusChange}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="h-8 bg-white text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Changes propagate to customer profile and dashboard metrics immediately.
                  </p>
                </div>

                {/* Instagram Attribution */}
                {selectedOrder.instagramAttribution && (
                  <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
                      <Instagram className="h-4 w-4 text-[#635BDB]" />
                      <span>Instagram Direct Attribution</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Trigger Keyword</span>
                        <span className="font-semibold text-[#635BDB]">
                          '{selectedOrder.instagramAttribution.triggerKeyword}'
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Touchpoint</span>
                        <span className="font-medium text-[#1E293B]">
                          {selectedOrder.instagramAttribution.sourceReelId || "DM Organic"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Customer & Shipping
                  </h4>
                  <div className="p-3.5 rounded-[10px] border border-[#E2E8F0] bg-white space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-[#1E293B]">
                      <User className="h-3.5 w-3.5 text-[#64748B]" />
                      <span>{selectedOrder.customerName}</span>
                      <span className="text-[#635BDB] font-normal">
                        ({selectedOrder.instagramUsername})
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[#64748B]">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        {selectedOrder.shippingAddress?.street},{" "}
                        {selectedOrder.shippingAddress?.city},{" "}
                        {selectedOrder.shippingAddress?.state} -{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Purchased */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Line Items
                  </h4>
                  <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-[10px] bg-white overflow-hidden">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#1E293B]">{item.productName}</p>
                          <p className="text-[10px] text-[#64748B]">SKU: {item.sku} • Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-[#1E293B]">{formatINR(item.total)}</p>
                      </div>
                    ))}
                    <div className="p-3 bg-[#F8FAFC] space-y-1 text-xs">
                      <div className="flex justify-between text-[#64748B]">
                        <span>Subtotal</span>
                        <span>{formatINR(selectedOrder.subtotal)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount (Coupon)</span>
                          <span>-{formatINR(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#64748B]">
                        <span>Shipping</span>
                        <span>{selectedOrder.shipping === 0 ? "FREE" : formatINR(selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-[#1E293B] pt-1 border-t border-[#E2E8F0]">
                        <span>Total Paid</span>
                        <span>{formatINR(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Payment Details
                  </h4>
                  <div className="p-3 rounded-[10px] border border-[#E2E8F0] bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#64748B]" />
                      <span className="font-medium text-[#1E293B]">{selectedOrder.paymentMethod}</span>
                    </div>
                    <StatusBadge status={selectedOrder.paymentStatus} />
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Fulfillment Timeline
                  </h4>
                  <div className="space-y-3 pl-2 border-l-2 border-[#E2E8F0] ml-2">
                    {selectedOrder.timeline?.map((entry, idx) => (
                      <div key={idx} className="relative pl-4 text-xs">
                        <span className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-[#635BDB] ring-4 ring-white" />
                        <p className="font-semibold text-[#1E293B]">{entry.title}</p>
                        <p className="text-[10px] text-[#64748B]">{entry.description}</p>
                        <span className="text-[9px] text-[#94A3B8] block mt-0.5">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="p-4 border-t border-[#E2E8F0]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailOpen(false)}
                  className="w-full text-xs"
                >
                  Close Drawer
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
