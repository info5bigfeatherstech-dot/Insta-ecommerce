"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatINR,
  formatDate,
  formatRelativeTime,
  generateSVGPlaceholder,
} from "@/lib/utils";
import { Instagram } from "@/components/shared/icons";
import {
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Zap,
  Film,
  Package,
  Calendar,
} from "lucide-react";

function OrderDetailContent() {
  const params = useParams();
  const id = params?.id;

  const { data: order, isLoading } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus();

  const [fulfillmentStatus, setFulfillmentStatus] = React.useState("");

  React.useEffect(() => {
    if (order) {
      setFulfillmentStatus(order.fulfillmentStatus);
    }
  }, [order]);

  if (isLoading) {
    return <LoadingState text="Loading order details..." />;
  }

  if (!order) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Order Not Found"
        description={`No order found matching identifier "${id}". It may have been deleted.`}
        actionLabel="Back to Orders"
        actionHref="/orders"
      />
    );
  }

  const handleStatusChange = async (newStatus) => {
    setFulfillmentStatus(newStatus);
    await updateStatusMutation.mutateAsync({
      id: order.id,
      status: newStatus,
      notes: `Fulfillment status updated to ${newStatus}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Detail Header */}
      <DetailPageHeader
        backHref="/orders"
        backLabel="Back to Orders"
        title={order.orderNumber}
        subtitle={`Placed on ${formatDate(order.createdAt, "dd MMMM yyyy, hh:mm a")} • Channel: ${
          order.instagramAttribution ? "Instagram DM Automation" : "Direct Web Store"
        }`}
        badge={<StatusBadge status={order.fulfillmentStatus} />}
      />

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-5 pb-3 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#1E293B]">
                  Purchased Items ({order.items?.length || 0})
                </CardTitle>
                <p className="text-xs text-[#64748B]">
                  Verified items packaged for delivery
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#F1F5F9]">
              {order.items?.map((item, idx) => {
                const placeholder = generateSVGPlaceholder({
                  text: item.productName,
                  type: "product",
                  identifier: item.productId || idx,
                });

                return (
                  <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={placeholder}
                        alt={item.productName}
                        className="h-14 w-14 rounded-[8px] object-cover shrink-0 border border-[#E2E8F0]"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-bold text-sm text-[#1E293B] hover:text-[#635BDB] truncate block transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          SKU: {item.sku || "SKU-STD"} • Qty: {item.quantity}
                        </p>
                        <p className="text-xs font-semibold text-[#635BDB] mt-0.5">
                          {formatINR(item.price)} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-[#1E293B] block">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Instagram Conversion Attribution Card */}
          {order.instagramAttribution && (
            <Card className="border-[#C7D2FE] bg-[#EEF2FF]/40">
              <CardHeader className="p-5 pb-3 border-b border-[#C7D2FE]/60">
                <CardTitle className="text-sm font-bold text-[#635BDB] flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram DM Automated Attribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs text-[#475569] leading-relaxed">
                  This checkout converted through an automated Instagram DM response flow.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] block">Triggered Reel Post</span>
                    <Link
                      href={`/reels/${order.instagramAttribution.reelId}`}
                      className="font-bold text-[#635BDB] hover:underline flex items-center gap-1"
                    >
                      <Film className="h-3 w-3" />
                      <span>View Reel ({order.instagramAttribution.reelPostId || order.instagramAttribution.reelId})</span>
                    </Link>
                  </div>
                  <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] block">Follower Keyword Trigger</span>
                    <span className="font-bold text-[#1E293B] inline-flex items-center gap-1 bg-[#EEF2FF] px-2 py-0.5 rounded text-[11px] text-[#635BDB]">
                      <Zap className="h-3 w-3" />
                      &quot;{order.instagramAttribution.keyword || "LINK"}&quot;
                    </span>
                  </div>
                  <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] block">DM Dispatch Time</span>
                    <span className="font-medium text-[#1E293B]">
                      {formatDate(order.instagramAttribution.dmSentAt, "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>
                  <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1">
                    <span className="text-[10px] text-[#64748B] block">Conversion Coupon Applied</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] inline-block">
                      {order.instagramAttribution.couponCode || "INSTA15"} (Attributed)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-5 pb-3 border-b border-[#F1F5F9]">
              <CardTitle className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#635BDB]" />
                <span>Order Timeline &amp; Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l-2 border-[#E2E8F0] ml-3 pl-5 space-y-5">
                {(order.timeline || [
                  { status: "delivered", timestamp: order.createdAt, note: "Order delivered to recipient" },
                  { status: "shipped", timestamp: order.createdAt, note: "Handed over to Blue Dart Express" },
                  { status: "processing", timestamp: order.createdAt, note: "Payment verified, packed at warehouse" },
                  { status: "pending", timestamp: order.createdAt, note: "Order created from automated checkout" },
                ]).map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#635BDB]" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1E293B] capitalize">
                          {step.status}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {formatDate(step.timestamp, "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary Column (1 span) */}
        <div className="space-y-6">
          {/* Fulfillment Status Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Fulfillment Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Select
                value={fulfillmentStatus}
                onValueChange={handleStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[#64748B]">
                Changes save directly to shared database and update dashboard metrics in real time.
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Payment &amp; Totals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Payment Method</span>
                <span className="font-semibold text-[#1E293B]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Payment Status</span>
                <span className="font-semibold text-emerald-700 capitalize">{order.paymentStatus}</span>
              </div>
              <div className="border-t border-[#F1F5F9] pt-2 space-y-1.5">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span>{formatINR(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Express Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Taxes (GST 18% Incl.)</span>
                  <span>{formatINR(Math.round(order.totalAmount * 0.18))}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1E293B] pt-2 border-t border-[#E2E8F0]">
                  <span>Total Paid</span>
                  <span className="text-[#635BDB]">{formatINR(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Customer Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <p className="font-bold text-sm text-[#1E293B]">{order.customerName}</p>
                <p className="text-xs font-semibold text-[#635BDB]">{order.instagramUsername}</p>
              </div>
              <div className="space-y-1 text-[#64748B]">
                <p>{order.customerEmail || `${order.customerName.toLowerCase().replace(/\s+/g, "")}@gmail.com`}</p>
                <p>{order.customerPhone || "+91 98201 44521"}</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full text-xs h-8">
                  <Link href={`/customers/${order.customerId}`}>
                    <span>View Full CRM Profile</span>
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs text-[#64748B] space-y-1">
              <p className="font-semibold text-[#1E293B]">
                {order.shippingAddress?.street || "Flat 402, Green Acres Residency"}
              </p>
              <p>{order.shippingAddress?.city || "Mumbai"}, {order.shippingAddress?.state || "Maharashtra"} - {order.shippingAddress?.postalCode || "400050"}</p>
              <p>India</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading order..." />}>
      <OrderDetailContent />
    </Suspense>
  );
}
