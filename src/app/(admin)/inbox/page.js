"use client";

import * as React from "react";
import Link from "next/link";
import {
  useConversations,
  useConversation,
  useSendMessage,
  useUpdateConversationStatus,
  useDmActivity,
} from "@/hooks/use-messages";
import { useInboxStore } from "@/store/inbox-store";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  formatDate,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  generateSVGPlaceholder,
} from "@/lib/utils";
import { Instagram } from "@/components/shared/icons";
import {
  MessageSquare,
  Activity,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  CheckCircle2,
  UserCheck,
  ArrowLeft,
  MoreVertical,
  ExternalLink,
  Zap,
  ShoppingBag,
  Filter,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/data/db";

export default function InboxPage() {
  const [activeTab, setActiveTab] = React.useState("inbox"); // "inbox" | "dm_activity"

  // Zustand Inbox state
  const selectedConversationId = useInboxStore((s) => s.selectedConversationId);
  const setSelectedConversationId = useInboxStore((s) => s.setSelectedConversationId);
  const activeFilter = useInboxStore((s) => s.activeFilter);
  const setActiveFilter = useInboxStore((s) => s.setActiveFilter);
  const searchQuery = useInboxStore((s) => s.searchQuery);
  const setSearchQuery = useInboxStore((s) => s.setSearchQuery);
  const mobileView = useInboxStore((s) => s.mobileView);
  const setMobileView = useInboxStore((s) => s.setMobileView);

  // DM Activity table state
  const [dmaSearch, setDmaSearch] = React.useState("");
  const [dmaStatus, setDmaStatus] = React.useState("all");
  const [dmaPage, setDmaPage] = React.useState(1);

  // Reply message input
  const [replyText, setReplyText] = React.useState("");

  // Queries
  const { data: conversations = [], isLoading: isConvLoading } = useConversations({
    search: searchQuery,
    filter: activeFilter,
  });

  // Automatically select first conversation if none selected on desktop
  React.useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [selectedConversationId, conversations, setSelectedConversationId]);

  const { data: currentConv } = useConversation(selectedConversationId);
  const sendMessageMutation = useSendMessage();
  const updateStatusMutation = useUpdateConversationStatus();

  // DM Activity query
  const { data: dmaData, isLoading: isDmaLoading } = useDmActivity({
    search: dmaSearch,
    status: dmaStatus,
    page: dmaPage,
    limit: 10,
  });

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedConversationId) return;
    const textToSend = replyText.trim();
    setReplyText("");
    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversationId,
      text: textToSend,
    });
  };

  const handleResolve = () => {
    if (!selectedConversationId || !currentConv) return;
    const newStatus = currentConv.status === "resolved" ? "active" : "resolved";
    updateStatusMutation.mutate({ conversationId: selectedConversationId, status: newStatus });
  };

  // DM Activity columns
  const dmaColumns = [
    {
      key: "customerName",
      label: "Customer",
      render: (val, row) => (
        <div>
          <Link
            href={`/customers/${row.customerId}`}
            className="font-semibold text-xs text-[#1E293B] hover:text-[#635BDB] block"
          >
            {val}
          </Link>
          <span className="text-[10px] text-[#635BDB]">{row.username}</span>
        </div>
      ),
    },
    {
      key: "automationName",
      label: "Automation",
      render: (val, row) => (
        <Link
          href={`/automations/${row.automationId}`}
          className="font-medium text-xs text-[#1E293B] hover:text-[#635BDB] block truncate max-w-xs"
        >
          {val}
        </Link>
      ),
    },
    {
      key: "message",
      label: "Message Sent",
      render: (val) => (
        <span className="text-xs text-[#64748B] line-clamp-1 max-w-xs">{val}</span>
      ),
    },
    {
      key: "sentTime",
      label: "Sent At",
      sortable: true,
      render: (val) => <span className="text-xs text-[#64748B]">{formatDate(val)}</span>,
    },
    {
      key: "deliveryStatus",
      label: "Delivery",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "clickStatus",
      label: "Link Click",
      render: (val) => (
        val === "clicked" ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
            <span>Clicked</span>
          </span>
        ) : (
          <span className="text-xs text-[#94A3B8]">Not clicked</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E293B]">
            Inbox & DM Activity
          </h1>
          <p className="text-xs text-[#64748B]">
            Manage live Instagram Direct Message customer queries and review automated DM delivery logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="bg-white border border-[#E2E8F0]">
            <TabsTrigger value="inbox" className="text-xs gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Live Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="dm_activity" className="text-xs gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>DM Dispatch Logs</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab 1: 3-Column Live Inbox */}
      {activeTab === "inbox" && (
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden shadow-xs h-[calc(100vh-190px)] min-h-[580px] flex">
          {/* Column 1: Conversations List (Visible always on desktop; on mobile only when mobileView === 'list') */}
          <div
            className={`w-full md:w-80 lg:w-88 border-r border-[#E2E8F0] flex flex-col shrink-0 bg-white ${
              mobileView === "detail" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search & Filter Header */}
            <div className="p-3 border-b border-[#E2E8F0] space-y-2 bg-[#F8FAFC]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-8 h-8 text-xs bg-white"
                />
              </div>

              {/* Filters: All, Unread, Assigned to me, Resolved */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "assigned", label: "Assigned" },
                  { id: "resolved", label: "Resolved" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 text-[11px] rounded-[6px] font-medium whitespace-nowrap transition-colors ${
                      activeFilter === f.id
                        ? "bg-[#635BDB] text-white"
                        : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No conversations match this filter.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = selectedConversationId === conv.id;
                  const palette = getAvatarColor(conv.customerName);
                  const initials = getInitials(conv.customerName);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 relative ${
                        isSelected ? "bg-[#EEF2FF]/60" : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {conv.unread && (
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#635BDB]" />
                      )}

                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback
                          style={{ backgroundColor: palette.bg, color: palette.text }}
                          className="font-bold text-xs"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs truncate ${
                              conv.unread ? "font-bold text-[#1E293B]" : "font-semibold text-[#1E293B]"
                            }`}
                          >
                            {conv.customerName}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] shrink-0">
                            {formatRelativeTime(conv.lastMessageTimestamp)}
                          </span>
                        </div>

                        <span className="text-[10px] text-[#635BDB] font-medium block truncate">
                          {conv.username}
                        </span>

                        <p
                          className={`text-xs truncate mt-1 ${
                            conv.unread ? "font-semibold text-[#1E293B]" : "text-[#64748B]"
                          }`}
                        >
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Active Chat Messages (Center) */}
          <div
            className={`flex-1 flex flex-col bg-[#F8FAFC] ${
              mobileView === "list" ? "hidden md:flex" : "flex"
            }`}
          >
            {currentConv ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-[#E2E8F0] bg-white px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileView("list")}
                      className="md:hidden h-8 w-8 text-[#64748B]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <Avatar className="h-8 w-8 border border-[#E2E8F0]">
                      <AvatarFallback
                        style={{
                          backgroundColor: getAvatarColor(currentConv.customerName).bg,
                          color: getAvatarColor(currentConv.customerName).text,
                        }}
                        className="font-bold text-xs"
                      >
                        {getInitials(currentConv.customerName)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1E293B]">
                          {currentConv.customerName}
                        </span>
                        <StatusBadge status={currentConv.status} />
                      </div>
                      <span className="text-[10px] text-[#635BDB] font-medium block">
                        {currentConv.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResolve}
                      className="h-7 px-2.5 text-xs text-[#1E293B] gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{currentConv.status === "resolved" ? "Reopen" : "Resolve"}</span>
                    </Button>
                  </div>
                </div>

                {/* Messages Bubbles Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentConv.messages?.map((msg) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-[14px] px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                            isUser
                              ? "bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-[2px]"
                              : "bg-[#635BDB] text-white rounded-br-[2px]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isUser ? "text-[#94A3B8]" : "text-white/80"
                            }`}
                          >
                            <span>{formatDate(msg.timestamp, "hh:mm a")}</span>
                            {!isUser && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                        {msg.isAutomation && (
                          <span className="text-[9px] text-[#635BDB] font-medium mt-0.5 mr-1">
                            Triggered via Automation
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Box */}
                <form
                  onSubmit={handleSend}
                  className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => toast.info("Simulated attachment picker")}
                    className="h-8 w-8 text-[#64748B]"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a manual reply as store agent..."
                    className="h-9 text-xs flex-1"
                  />

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim() || sendMessageMutation.isPending}
                    className="h-9 px-3 gap-1"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[#64748B]">
                Select a conversation to view chat thread.
              </div>
            )}
          </div>

          {/* Column 3: Contact & Customer Dossier Panel (Right - hidden on mobile/small screens) */}
          <div className="w-80 border-l border-[#E2E8F0] bg-white hidden xl:flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
            {currentConv ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Customer Context
                  </h4>
                  <Link
                    href={`/customers/${currentConv.customerId}`}
                    className="text-xs font-semibold text-[#635BDB] hover:underline flex items-center gap-0.5"
                  >
                    <span>Full Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Customer basic info */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Contact Details
                  </span>
                  <p className="font-bold text-[#1E293B]">{currentConv.customerName}</p>
                  <p className="text-[#635BDB] font-medium">{currentConv.username}</p>
                  <p className="text-[#64748B]">{currentConv.customer?.city || "India"}</p>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentConv.tags?.map((t) => (
                      <span
                        key={t.id}
                        style={{ backgroundColor: t.bgColor, color: t.color }}
                        className="text-[10px] px-2 py-0.5 rounded-[4px] font-semibold border border-opacity-30"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products Interacted With */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Products of Interest
                  </span>
                  <div className="space-y-1.5">
                    {currentConv.products?.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#635BDB] flex items-center justify-between text-xs transition-colors group"
                      >
                        <span className="truncate max-w-[140px] font-medium text-[#1E293B] group-hover:text-[#635BDB]">
                          {p.name}
                        </span>
                        <span className="font-bold text-[#1E293B]">{formatINR(p.price)}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Automation Activity */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Recent Automation Logs
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {currentConv.recentAutomation?.map((ra) => (
                      <Link
                        key={ra.id}
                        href={`/automations/${ra.automationId}`}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] bg-white hover:border-[#635BDB] space-y-1 block transition-colors group"
                      >
                        <span className="font-semibold text-[#1E293B] group-hover:text-[#635BDB] block truncate">
                          {ra.automationName}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                          <span>{formatDate(ra.sentTime, "dd MMM")}</span>
                          <StatusBadge status={ra.deliveryStatus} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab 2: DM Dispatch Logs Table */}
      {activeTab === "dm_activity" && (
        <DataTable
          columns={dmaColumns}
          data={dmaData?.activities || []}
          isLoading={isDmaLoading}
          searchPlaceholder="Search recipient handle, automation, message..."
          searchValue={dmaSearch}
          onSearchChange={(val) => {
            setDmaSearch(val);
            setDmaPage(1);
          }}
          exportFilename="dm_dispatch_logs"
          filters={
            <FilterDropdown
              label="Delivery Status"
              value={dmaStatus}
              onChange={(val) => {
                setDmaStatus(val);
                setDmaPage(1);
              }}
              options={[
                { value: "all", label: "All Deliveries" },
                { value: "delivered", label: "Delivered (Success)" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
            />
          }
          pagination={{
            page: dmaData?.pagination?.page || 1,
            limit: dmaData?.pagination?.limit || 10,
            totalRecords: dmaData?.pagination?.totalRecords || 0,
            totalPages: dmaData?.pagination?.totalPages || 1,
            onPageChange: (newPage) => setDmaPage(newPage),
          }}
        />
      )}
    </div>
  );
}
