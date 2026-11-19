"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCustomer,
  useAddTagToCustomer,
  useRemoveTagFromCustomer,
  useUpdateCustomer,
} from "@/hooks/use-customers";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatINR,
  formatNumber,
  formatDate,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  generateSVGPlaceholder,
} from "@/lib/utils";
import { Instagram } from "@/components/shared/icons";
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Zap,
  Film,
  Edit2,
  MapPin,
} from "lucide-react";
import { db } from "@/data/db";

function CustomerProfileContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { data: customer, isLoading } = useCustomer(id);
  const addTagMutation = useAddTagToCustomer();
  const removeTagMutation = useRemoveTagFromCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const [editOpen, setEditOpen] = React.useState(false);

  const allTags = db.state.tags;

  if (isLoading || !customer) {
    return <LoadingState text="Loading customer dossier and interaction history..." />;
  }

  const handleSaveCustomer = async (formData) => {
    await updateCustomerMutation.mutateAsync({
      id: customer.id,
      data: {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    });
  };

  const palette = getAvatarColor(customer.name);
  const initials = getInitials(customer.name);

  return (
    <div className="space-y-6">
      {/* Detail Page Header with Back button */}
      <DetailPageHeader
        backHref="/customers"
        backLabel="Back to Customers"
        title={customer.name}
        subtitle={`${customer.username} • Customer ID: ${customer.instagramUserId} • First contact ${formatDate(
          customer.firstInteraction,
          "dd MMM yyyy"
        )}`}
        badge={<StatusBadge status={customer.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="text-xs gap-1.5 font-semibold text-[#1E293B] hover:text-[#635BDB]"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Details & Address</span>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
              <Link href={`/inbox?user=${customer.username}`}>
                <MessageSquare className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Open in Inbox</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-[#E2E8F0]">
          <span className="text-xs text-[#64748B]">Lifetime Value</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatINR(customer.lifetimeSpend || 0)}
          </p>
        </Card>
        <Card className="p-4 border-[#E2E8F0]">
          <span className="text-xs text-[#64748B]">Completed Orders</span>
          <p className="text-xl font-bold text-[#1E293B] mt-1">
            {customer.ordersCount || 0}
          </p>
        </Card>
        <Card className="p-4 border-[#E2E8F0]">
          <span className="text-xs text-[#64748B]">DM Conversations</span>
          <p className="text-xl font-bold text-[#635BDB] mt-1">
            {customer.totalMessages || 0} msgs
          </p>
        </Card>
        <Card className="p-4 border-[#E2E8F0]">
          <span className="text-xs text-[#64748B]">Click-Through Rate</span>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {customer.linksSent > 0
              ? `${Math.round((customer.linksClicked / customer.linksSent) * 100)}%`
              : "0%"}
          </p>
        </Card>
      </div>

      {/* Customer Journey Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customer Conversion Journey</CardTitle>
          <CardDescription>
            Lifecycle progression from initial Instagram Reel discovery to completed store order
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {customer.journey?.map((step) => {
              const isDone = step.status === "completed";
              return (
                <div
                  key={step.step}
                  className={`p-3.5 rounded-[10px] border transition-all flex flex-col justify-between ${
                    isDone
                      ? "bg-white border-[#635BDB]/30 shadow-xs"
                      : "bg-[#F8FAFC] border-[#E2E8F0] opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#94A3B8]">
                        STEP {step.step}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-[#94A3B8]" />
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-[#1E293B]">{step.title}</h5>
                    <p className="text-[10px] text-[#64748B] mt-1 line-clamp-3 leading-relaxed">
                      {step.details}
                    </p>
                  </div>

                  <span className="text-[9px] text-[#94A3B8] font-medium block mt-3">
                    {step.timestamp ? formatDate(step.timestamp, "dd MMM, hh:mm a") : "Pending action"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Profile Info, Custom Fields, Tags, Instagram Account Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info & Instagram Details */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-[#E2E8F0]">
                <AvatarFallback
                  style={{ backgroundColor: palette.bg, color: palette.text }}
                  className="font-bold text-sm"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">{customer.name}</h3>
                <p className="text-xs text-[#64748B]">{customer.address?.city || customer.city || "India"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-7 px-2 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1 font-semibold"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5" />
                <span>Instagram Handle</span>
              </span>
              <span className="font-semibold text-[#635BDB]">{customer.username}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#F1F5F9]">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Address</span>
              </span>
              <span className="font-medium text-[#1E293B]">{customer.email || "—"}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#F1F5F9]">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>Phone</span>
              </span>
              <span className="font-medium text-[#1E293B]">{customer.phone || "—"}</span>
            </div>

            {/* Person Physical Address */}
            <div className="flex items-start justify-between py-1 border-t border-[#F1F5F9]">
              <span className="text-[#64748B] flex items-center gap-1.5 shrink-0 pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Address</span>
              </span>
              <div className="text-right space-y-0.5">
                <span className="font-medium text-[#1E293B] block">
                  {customer.address?.street || "Flat 402, Green Acres Residency"}
                </span>
                <span className="text-[11px] text-[#64748B] block">
                  {customer.address?.city || customer.city || "Mumbai"}, {customer.address?.state || "Maharashtra"} - {customer.address?.postalCode || "400050"}
                </span>
                <span className="text-[10px] text-[#94A3B8] block">
                  {customer.address?.country || "India"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#F1F5F9]">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>First Touchpoint</span>
              </span>
              <span className="font-medium text-[#1E293B]">
                {formatDate(customer.firstInteraction, "dd MMM yyyy")}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#F1F5F9]">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5" />
                <span>Acquired Via Reel</span>
              </span>
              {customer.sourceReel?.id ? (
                <Link
                  href={`/reels/${customer.sourceReel.id}`}
                  className="font-medium text-[#635BDB] hover:underline flex items-center gap-1"
                >
                  <span>{customer.sourceReel.instagramPostId || customer.sourceReel.id}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="font-medium text-[#1E293B]">
                  {customer.sourceReel?.instagramPostId || "Organic Explore"}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Tags Management */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Audience Tags & Segmentation
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    <span>Assign Tag</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-[10px]">Add Segment Tag</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allTags.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() =>
                        addTagMutation.mutate({ customerId: customer.id, tagId: t.id })
                      }
                      className="text-xs"
                    >
                      <span
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2 pt-3">
              {(customer.tags || []).map((tId) => {
                const t = allTags.find((tag) => tag.id === tId);
                if (!t) return null;
                return (
                  <span
                    key={t.id}
                    style={{ backgroundColor: t.bgColor, color: t.color, borderColor: t.color }}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[6px] font-semibold border border-opacity-30"
                  >
                    <span>{t.name}</span>
                    <X
                      className="h-3.5 w-3.5 cursor-pointer hover:opacity-75"
                      onClick={() =>
                        removeTagMutation.mutate({ customerId: customer.id, tagId: t.id })
                      }
                    />
                  </span>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] pt-4 mt-4 border-t border-[#E2E8F0]">
            Tags are updated automatically during keyword trigger executions and order webhook events.
          </p>
        </Card>

        {/* Custom Fields & Notes */}
        <Card className="p-5 space-y-3">
          <div className="pb-2 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Custom Fields & Instagram Bio
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase block mb-1">
                Instagram Bio
              </span>
              <p className="text-xs italic text-[#1E293B]">
                "{customer.customFields?.instagramBio || "No bio available"}"
              </p>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase block mb-1">
                Internal CRM Notes
              </span>
              <p className="text-xs text-[#1E293B]">
                {customer.customFields?.notes || "No notes"}
              </p>
            </div>

            {customer.customFields?.preferredSize && (
              <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0]">
                <span className="text-[11px] text-[#64748B]">Preferred Size:</span>
                <span className="font-bold text-[#1E293B]">{customer.customFields.preferredSize}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Orders Placed & Products Interacted With */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Placed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Orders Placed ({customer.orders?.length || 0})</CardTitle>
              <CardDescription>Attributed store transactions</CardDescription>
            </div>
            <ShoppingBag className="h-4 w-4 text-[#635BDB]" />
          </CardHeader>
          <CardContent className="p-0">
            {customer.orders && customer.orders.length > 0 ? (
              <div className="divide-y divide-[#E2E8F0]">
                {customer.orders.map((ord) => (
                  <Link
                    key={ord.id}
                    href={`/orders/${ord.id}`}
                    className="p-4 flex items-center justify-between text-xs hover:bg-[#F8FAFC] group transition-colors block"
                  >
                    <div>
                      <p className="font-semibold text-[#1E293B] group-hover:text-[#635BDB] flex items-center gap-1.5">
                        <span>{ord.orderNumber}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {formatDate(ord.createdAt)} • {ord.items?.length} items
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-bold text-[#1E293B] block">
                          {formatINR(ord.totalAmount)}
                        </span>
                        <StatusBadge status={ord.fulfillmentStatus} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#64748B]">
                No completed orders yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Interacted With */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Products Interacted With ({customer.products?.length || 0})</CardTitle>
              <CardDescription>Items customer inquired about or clicked</CardDescription>
            </div>
            <Zap className="h-4 w-4 text-[#635BDB]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0]">
              {customer.products?.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.id}`}
                  className="p-3.5 flex items-center gap-3 text-xs hover:bg-[#F8FAFC] group transition-colors block"
                >
                  <img
                    src={generateSVGPlaceholder({
                      text: prod.name,
                      type: "product",
                      identifier: prod.id,
                    })}
                    alt={prod.name}
                    className="h-10 w-10 rounded-[6px] object-cover shrink-0 border border-[#E2E8F0]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1E293B] truncate group-hover:text-[#635BDB] flex items-center gap-1">
                      <span>{prod.name}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-[10px] text-[#64748B]">SKU: {prod.sku}</p>
                  </div>
                  <span className="font-bold text-[#1E293B]">{formatINR(prod.price)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Direct Message & Automation Dispatch Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Direct Message & Automation Dispatch Logs</CardTitle>
          <CardDescription>
            Outbound automated messages, click status, and delivery timestamps
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-y border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Automation Workflow</th>
                  <th className="py-2.5 px-4 font-semibold">Message Preview</th>
                  <th className="py-2.5 px-3 font-semibold">Dispatched</th>
                  <th className="py-2.5 px-3 font-semibold">Delivery Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Click Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {customer.dmActivity && customer.dmActivity.length > 0 ? (
                  customer.dmActivity.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-[#1E293B]">
                        {log.automationId ? (
                          <Link
                            href={`/automations/${log.automationId}`}
                            className="text-[#635BDB] hover:underline flex items-center gap-1"
                          >
                            <span>{log.automationName}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          log.automationName
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">
                        {formatDate(log.sentTime, "dd MMM, hh:mm a")}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={log.deliveryStatus} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.clickStatus === "clicked" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Clicked</span>
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">Not clicked</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-[#64748B]">
                      No direct message automation logs for this user yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Profile & Address Dialog */}
      <EditCustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={{
          name: customer.name,
          username: customer.username,
          email: customer.email,
          phone: customer.phone,
          street: customer.address?.street,
          city: customer.address?.city || customer.city,
          state: customer.address?.state,
          postalCode: customer.address?.postalCode,
          country: customer.address?.country || "India",
        }}
        onSave={handleSaveCustomer}
        isLoading={updateCustomerMutation.isPending}
      />
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<LoadingState text="Loading customer dossier..." />}>
      <CustomerProfileContent />
    </Suspense>
  );
}
