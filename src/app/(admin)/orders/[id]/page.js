"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdateOrderCustomer,
  useUpdateOrderItems,
} from "@/hooks/use-orders";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Edit2,
  Mail,
  Phone,
  Plus,
  Minus,
  Trash2,
  Check,
  RotateCcw,
  Loader2,
  Search,
} from "lucide-react";
import { db } from "@/data/db";
import { toast } from "sonner";

function OrderDetailContent() {
  const params = useParams();
  const id = params?.id;

  const { data: order, isLoading } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus();
  const updateCustomerMutation = useUpdateOrderCustomer();
  const updateItemsMutation = useUpdateOrderItems();

  const [fulfillmentStatus, setFulfillmentStatus] = React.useState("");
  const [editCustomerOpen, setEditCustomerOpen] = React.useState(false);
  const [draftItems, setDraftItems] = React.useState([]);
  const [addProductModalOpen, setAddProductModalOpen] = React.useState(false);
  const [productSearch, setProductSearch] = React.useState("");

  React.useEffect(() => {
    if (order) {
      setFulfillmentStatus(order.fulfillmentStatus);
      if (order.items) {
        setDraftItems(order.items.map((it) => ({ ...it })));
      }
    }
  }, [order]);

  const isItemsDirty = React.useMemo(() => {
    if (!order?.items || !draftItems) return false;
    if (draftItems.length !== order.items.length) return true;
    return draftItems.some((draft) => {
      const orig = order.items.find(
        (o) => (o.productId || o.sku) === (draft.productId || draft.sku)
      );
      return !orig || orig.quantity !== draft.quantity;
    });
  }, [order, draftItems]);

  const draftSubtotal = React.useMemo(() => {
    return draftItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 0), 0);
  }, [draftItems]);

  const draftTotal = React.useMemo(() => {
    if (!order) return 0;
    return Math.max(0, draftSubtotal - (order.discount || 0) + (order.shipping || 0));
  }, [draftSubtotal, order]);

  const handleQuantityChange = (index, delta) => {
    setDraftItems((prev) => {
      const next = [...prev];
      const current = next[index];
      const newQty = (current.quantity || 1) + delta;
      if (newQty <= 0) {
        if (next.length === 1) {
          toast.error("Order must contain at least 1 item");
          return prev;
        }
        next.splice(index, 1);
      } else {
        next[index] = { ...current, quantity: newQty };
      }
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    if (draftItems.length <= 1) {
      toast.error("Order must contain at least 1 item");
      return;
    }
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDiscardItems = () => {
    if (order?.items) {
      setDraftItems(order.items.map((it) => ({ ...it })));
      toast.info("Item modifications discarded");
    }
  };

  const handleApplyItems = async () => {
    await updateItemsMutation.mutateAsync({
      orderId: order.id,
      items: draftItems,
    });
  };

  const availableProducts = React.useMemo(() => {
    const all = db.state.products || [];
    if (!productSearch.trim()) return all;
    const q = productSearch.toLowerCase();
    return all.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [productSearch]);

  const handleAddProductToDraft = (product) => {
    setDraftItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.productId === product.id);
      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          total: product.price,
        },
      ];
    });
    setAddProductModalOpen(false);
    setProductSearch("");
    toast.info(`Added "${product.name}" to order package. Click Apply Changes to save.`);
  };

  const handleSaveCustomerDetails = async (formData) => {
    await updateCustomerMutation.mutateAsync({
      orderId: order.id,
      customerData: {
        customerName: formData.name,
        instagramUsername: formData.username,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    });
  };

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
          {/* Order Items Card with +/- Quantity and Apply Changes Button */}
          <Card className="border-[#E2E8F0] overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                  <span>Purchased Items ({draftItems.length})</span>
                  {isItemsDirty && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Modified (Unsaved)</span>
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-[#64748B]">
                  Verified items packaged for delivery • Adjust quantities with + / -
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddProductModalOpen(true)}
                  className="h-8 text-xs gap-1 text-[#635BDB] border-[#C7D2FE] hover:bg-[#EEF2FF]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Product</span>
                </Button>
                {isItemsDirty && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDiscardItems}
                      disabled={updateItemsMutation.isPending}
                      className="h-8 text-xs text-[#64748B] hover:text-[#1E293B]"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      <span>Discard</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyItems}
                      disabled={updateItemsMutation.isPending}
                      className="h-8 text-xs gap-1.5 shadow-sm bg-[#635BDB] hover:bg-[#5248c8]"
                    >
                      {updateItemsMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Applying...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Apply Changes</span>
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-[#F1F5F9]">
              {draftItems.map((item, idx) => {
                const placeholder = generateSVGPlaceholder({
                  text: item.productName,
                  type: "product",
                  identifier: item.productId || idx,
                });

                const originalItem = order.items?.find(
                  (o) => (o.productId || o.sku) === (item.productId || item.sku)
                );
                const isModified = !originalItem || originalItem.quantity !== item.quantity;

                return (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]/50 transition-colors">
                    {/* Left: Image & Details */}
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
                          SKU: {item.sku || "SKU-STD"} • Unit Price: {formatINR(item.price)}
                        </p>
                        <p className="text-xs font-semibold text-[#635BDB] mt-0.5">
                          {formatINR(item.price)} each
                        </p>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper (+ -) and Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#F1F5F9]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#CBD5E1] rounded-[6px] bg-white overflow-hidden shadow-2xs">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(idx, -1)}
                          disabled={item.quantity <= 1 && draftItems.length === 1}
                          className="h-8 w-8 rounded-none text-[#475569] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
                          title="Decrease quantity (-)"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-10 text-center text-xs font-bold text-[#1E293B] select-none">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(idx, 1)}
                          className="h-8 w-8 rounded-none text-[#475569] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
                          title="Increase quantity (+)"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Remove item button if multiple items */}
                      {draftItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-8 w-8 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-[6px]"
                          title="Remove item from order"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {/* Line Item Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="font-bold text-sm text-[#1E293B] block">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        {isModified && (
                          <span className="text-[10px] text-amber-600 font-semibold block">
                            Unsaved
                          </span>
                        )}
                      </div>
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
                  <div className="text-right">
                    <span className="font-semibold text-[#1E293B]">
                      {formatINR(isItemsDirty ? draftSubtotal : (order.subtotal || order.totalAmount))}
                    </span>
                    {isItemsDirty && (
                      <span className="text-[10px] text-amber-600 block font-medium">Pending Apply</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Express Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Taxes (GST 18% Incl.)</span>
                  <span>{formatINR(Math.round((isItemsDirty ? draftTotal : order.totalAmount) * 0.18))}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1E293B] pt-2 border-t border-[#E2E8F0]">
                  <span>Total Amount</span>
                  <div className="text-right">
                    <span className="text-[#635BDB]">{formatINR(isItemsDirty ? draftTotal : order.totalAmount)}</span>
                    {isItemsDirty && (
                      <span className="text-[10px] text-amber-600 block font-normal">
                        Click Apply to commit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Customer Profile</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditCustomerOpen(true)}
                className="h-6 px-2 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1 font-semibold"
                title="Edit customer details and address"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <p className="font-bold text-sm text-[#1E293B]">{order.customerName}</p>
                <p className="text-xs font-semibold text-[#635BDB] flex items-center gap-1 mt-0.5">
                  <Instagram className="h-3 w-3" />
                  <span>{order.instagramUsername}</span>
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                  <span className="truncate">
                    {order.customerEmail || `${order.customerName.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                  <span>{order.customerPhone || "+91 98201 44521"}</span>
                </div>
              </div>

              {/* Person Address */}
              <div className="space-y-1 pt-2 border-t border-[#F1F5F9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#635BDB]" />
                  <span>Person Address</span>
                </span>
                <p className="font-semibold text-[#1E293B] mt-1 leading-snug">
                  {order.shippingAddress?.street || "Flat 402, Green Acres Residency"}
                </p>
                <p className="text-[#64748B]">
                  {order.shippingAddress?.city || "Mumbai"}, {order.shippingAddress?.state || "Maharashtra"} - {order.shippingAddress?.postalCode || "400050"}
                </p>
                <p className="text-[#94A3B8] text-[11px]">
                  {order.shippingAddress?.country || "India"}
                </p>
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
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9] flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Delivery Address</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditCustomerOpen(true)}
                className="h-6 px-2 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1 font-semibold"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Address</span>
              </Button>
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

      {/* Edit Customer & Address Dialog */}
      <EditCustomerDialog
        open={editCustomerOpen}
        onOpenChange={setEditCustomerOpen}
        initialData={{
          name: order.customerName,
          username: order.instagramUsername,
          email: order.customerEmail,
          phone: order.customerPhone,
          street: order.shippingAddress?.street,
          city: order.shippingAddress?.city,
          state: order.shippingAddress?.state,
          postalCode: order.shippingAddress?.postalCode,
          country: order.shippingAddress?.country || "India",
        }}
        onSave={handleSaveCustomerDetails}
        isLoading={updateCustomerMutation.isPending}
      />

      {/* Add Product to Order Dialog */}
      <Dialog open={addProductModalOpen} onOpenChange={setAddProductModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-[#E2E8F0]">
            <DialogTitle className="text-sm font-bold text-[#1E293B] flex items-center gap-1.5">
              <Package className="h-4 w-4 text-[#635BDB]" />
              <span>Add Product to Order</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Select a catalog product to add to this order's package.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-[8px]">
              {availableProducts.length > 0 ? (
                availableProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddProductToDraft(p)}
                    className="p-2.5 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={generateSVGPlaceholder({ text: p.name, type: "product", identifier: p.id })}
                        alt={p.name}
                        className="h-9 w-9 rounded-[6px] object-cover shrink-0 border border-[#E2E8F0]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1E293B] group-hover:text-[#635BDB] truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-[#64748B]">SKU: {p.sku} • Stock: {p.stock}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#1E293B] block">{formatINR(p.price)}</span>
                      <span className="text-[10px] text-[#635BDB] font-semibold group-hover:underline">
                        + Add Item
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  No products found matching &quot;{productSearch}&quot;
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
