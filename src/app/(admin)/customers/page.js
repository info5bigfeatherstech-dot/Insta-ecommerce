"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCustomers,
  useAddTagToCustomer,
  useRemoveTagFromCustomer,
} from "@/hooks/use-customers";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
} from "@/lib/utils";
import { Instagram } from "@/components/shared/icons";
import {
  Users,
  UserPlus,
  Activity,
  RotateCcw,
  Tag as TagIcon,
  Plus,
  X,
  ExternalLink,
  Eye,
  ShoppingBag,
  MessageSquare,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { db } from "@/data/db";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [tag, setTag] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const { data, isLoading } = useCustomers({
    search,
    status,
    tag,
    page,
    limit: 10,
  });

  const addTagMutation = useAddTagToCustomer();
  const removeTagMutation = useRemoveTagFromCustomer();

  const handleOpenQuickView = (cust) => {
    setSelectedCustomer(cust);
    setDrawerOpen(true);
  };

  const handleAddTag = async (tagId) => {
    if (!selectedCustomer) return;
    await addTagMutation.mutateAsync({ customerId: selectedCustomer.id, tagId });
    // Update local drawer state
    setSelectedCustomer((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagId],
    }));
  };

  const handleRemoveTag = async (tagId) => {
    if (!selectedCustomer) return;
    await removeTagMutation.mutateAsync({ customerId: selectedCustomer.id, tagId });
    setSelectedCustomer((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagId),
    }));
  };

  const stats = data?.stats || { total: 0, new: 0, active: 0, returning: 0 };
  const allTags = db.state.tags;

  const columns = [
    {
      key: "name",
      label: "Customer / Contact",
      sortable: true,
      render: (val, row) => {
        const palette = getAvatarColor(row.name);
        const initials = getInitials(row.name);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback
                style={{
                  backgroundColor: palette.bg,
                  color: palette.text,
                  border: `1px solid ${palette.border}`,
                }}
                className="font-bold text-xs"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-xs text-[#1E293B] block hover:text-[#635BDB]">
                {val}
              </span>
              <span className="text-[10px] text-[#635BDB] font-medium block">
                {row.username}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "instagramUserId",
      label: "Instagram ID",
      render: (val) => <span className="font-mono text-[10px] text-[#64748B]">{val}</span>,
    },
    {
      key: "sourceReel",
      label: "Source Reel",
      render: (reel) => (
        <span className="text-xs text-[#64748B] truncate max-w-[140px] block" title={reel?.caption}>
          {reel ? reel.instagramPostId : "Direct / Search"}
        </span>
      ),
    },
    {
      key: "tagObjects",
      label: "Tags",
      render: (tagObjs, row) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {(row.tags || []).slice(0, 2).map((tId) => {
            const t = allTags.find((tag) => tag.id === tId);
            if (!t) return null;
            return (
              <span
                key={t.id}
                style={{ backgroundColor: t.bgColor, color: t.color, borderColor: t.color }}
                className="text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium border border-opacity-30 truncate"
              >
                {t.name}
              </span>
            );
          })}
          {(row.tags || []).length > 2 && (
            <span className="text-[10px] text-[#64748B] font-semibold bg-[#F1F5F9] px-1 rounded">
              +{row.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "totalMessages",
      label: "DMs Exchanged",
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#1E293B]">{val}</span>,
    },
    {
      key: "lastInteraction",
      label: "Last Seen",
      sortable: true,
      render: (val) => <span className="text-xs text-[#64748B]">{formatRelativeTime(val)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenQuickView(row)}
            className="h-7 px-2 text-xs text-[#635BDB] hover:bg-[#EEF2FF] gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/customers/${row.id}`)}
            className="h-7 w-7 text-[#64748B]"
            title="Full Profile"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers & Leads"
        description="Audience database captured automatically from Instagram Reels, comments, and direct messages."
      />

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Contacts</span>
            <Users className="h-4 w-4 text-[#635BDB]" />
          </div>
          <p className="text-2xl font-bold text-[#1E293B] mt-1.5">{stats.total}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-indigo-600">
            <span>New Leads</span>
            <UserPlus className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-1.5">{stats.new}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Active Shoppers</span>
            <Activity className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1.5">{stats.active}</p>
        </Card>

        <Card className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>Returning Buyers</span>
            <RotateCcw className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1.5">{stats.returning}</p>
        </Card>
      </div>

      {/* Customers DataTable */}
      <DataTable
        columns={columns}
        data={data?.customers || []}
        isLoading={isLoading}
        searchPlaceholder="Search customer name, handle, ID..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onRowClick={handleOpenQuickView}
        exportFilename="customers_list"
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
                { value: "new", label: "New Leads" },
                { value: "active", label: "Active" },
                { value: "returning", label: "Returning" },
              ]}
            />
            <FilterDropdown
              label="Tag"
              value={tag}
              onChange={(val) => {
                setTag(val);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Tags" },
                ...allTags.map((t) => ({ value: t.id, label: t.name })),
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

      {/* Customer Quick-View Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md lg:max-w-lg flex flex-col justify-between">
          {selectedCustomer && (
            <>
              <SheetHeader className="p-5 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-[#E2E8F0]">
                    <AvatarFallback
                      style={{
                        backgroundColor: getAvatarColor(selectedCustomer.name).bg,
                        color: getAvatarColor(selectedCustomer.name).text,
                      }}
                      className="font-bold text-sm"
                    >
                      {getInitials(selectedCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pr-6">
                    <SheetTitle className="text-base font-bold text-[#1E293B]">
                      {selectedCustomer.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-[#635BDB] font-medium flex items-center gap-1">
                      <Instagram className="h-3 w-3" />
                      <span>{selectedCustomer.username}</span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] block">Orders</span>
                    <span className="text-sm font-bold text-[#1E293B]">
                      {selectedCustomer.ordersCount || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] block">Lifetime Spend</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatINR(selectedCustomer.lifetimeSpend || 0)}
                    </span>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] block">Total Messages</span>
                    <span className="text-sm font-bold text-[#635BDB]">
                      {selectedCustomer.totalMessages || 0}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Contact Information
                  </h4>
                  <div className="p-3.5 rounded-[10px] border border-[#E2E8F0] bg-white space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#1E293B]">
                      <Mail className="h-3.5 w-3.5 text-[#64748B]" />
                      <span>{selectedCustomer.email || "No email linked"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#1E293B]">
                      <Phone className="h-3.5 w-3.5 text-[#64748B]" />
                      <span>{selectedCustomer.phone || "No phone linked"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#1E293B]">
                      <MapPin className="h-3.5 w-3.5 text-[#64748B]" />
                      <span>{selectedCustomer.city || "India"}</span>
                    </div>
                  </div>
                </div>

                {/* Tags Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Assigned Tags
                    </h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] gap-1">
                          <Plus className="h-3 w-3" />
                          <span>Add Tag</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-[10px]">Select Tag to Add</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allTags.map((t) => (
                          <DropdownMenuItem
                            key={t.id}
                            onClick={() => handleAddTag(t.id)}
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

                  <div className="flex flex-wrap gap-1.5 p-3 rounded-[10px] border border-[#E2E8F0] bg-white min-h-[44px]">
                    {(selectedCustomer.tags || []).map((tId) => {
                      const t = allTags.find((tag) => tag.id === tId);
                      if (!t) return null;
                      return (
                        <span
                          key={t.id}
                          style={{ backgroundColor: t.bgColor, color: t.color }}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[4px] font-medium border border-opacity-30"
                        >
                          <span>{t.name}</span>
                          <X
                            className="h-3 w-3 cursor-pointer hover:opacity-75"
                            onClick={() => handleRemoveTag(t.id)}
                          />
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Notes / Bio */}
                {selectedCustomer.customFields && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Instagram Bio & Notes
                    </h4>
                    <div className="p-3.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] space-y-1.5 text-xs text-[#64748B]">
                      <p className="italic text-[#1E293B]">
                        "{selectedCustomer.customFields.instagramBio}"
                      </p>
                      <p className="text-[11px] pt-1 border-t border-[#E2E8F0]">
                        Note: {selectedCustomer.customFields.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="p-4 border-t border-[#E2E8F0] flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 text-xs"
                >
                  Close
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                >
                  <Link href={`/customers/${selectedCustomer.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Full Profile</span>
                  </Link>
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
