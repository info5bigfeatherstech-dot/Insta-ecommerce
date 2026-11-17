"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useReel, useAssignAutomationToReel } from "@/hooks/use-reels";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CommentTriggerForm } from "@/components/reels/comment-trigger-form";
import { CommentSimulator } from "@/components/reels/comment-simulator";
import { ReelCommentsFeed } from "@/components/reels/reel-comments-feed";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatINR,
  formatNumber,
  formatDate,
  formatRelativeTime,
  generateSVGPlaceholder,
} from "@/lib/utils";
import { Instagram } from "@/components/shared/icons";
import {
  Film,
  Zap,
  PlayCircle,
  MessageSquare,
  History,
  ExternalLink,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/data/db";

function ReelDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;

  const defaultTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  React.useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const { data: reel, isLoading } = useReel(id);
  const assignMutation = useAssignAutomationToReel();

  const [assignedAutomationId, setAssignedAutomationId] = React.useState("");

  React.useEffect(() => {
    if (reel) {
      setAssignedAutomationId(reel.automationId || "none");
    }
  }, [reel]);

  if (isLoading) {
    return <LoadingState text="Loading Reel details & triggers..." />;
  }

  if (!reel) {
    return (
      <EmptyState
        icon={Film}
        title="Reel Not Found"
        description={`No Instagram Reel found matching identifier "${id}".`}
        actionLabel="Back to Reels"
        actionHref="/reels"
      />
    );
  }

  const handleAssignAutomation = async (autoId) => {
    const targetId = autoId === "none" ? null : autoId;
    setAssignedAutomationId(autoId);
    await assignMutation.mutateAsync({ reelId: reel.id, automationId: targetId });
  };

  const automationsList = db.state.automations;

  const placeholder = generateSVGPlaceholder({
    text: reel.caption,
    type: "reel",
    identifier: reel.id,
  });

  const ctr = reel.triggerCount > 0 ? Math.round((reel.linkClicks / reel.triggerCount) * 100) : 0;
  const convRate = reel.linkClicks > 0 ? Math.round((reel.conversions / reel.linkClicks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/reels"
        backLabel="Back to Reels & Posts"
        title={`Reel #${reel.instagramPostId}`}
        subtitle={`Published on ${formatDate(reel.publishedDate, "dd MMMM yyyy")} • ${formatNumber(reel.views)} organic views`}
        badge={<StatusBadge status={reel.status} />}
        actions={
          <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold gap-1.5">
            <a href={reel.postUrl} target="_blank" rel="noreferrer">
              <Instagram className="h-3.5 w-3.5" />
              <span>View on Instagram</span>
              <ExternalLink className="h-3 w-3 text-[#94A3B8]" />
            </a>
          </Button>
        }
      />

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <div className="bg-white p-1 rounded-[10px] border border-[#E2E8F0] shadow-2xs">
              <TabsList className="bg-[#F1F5F9] p-0.5 rounded-[8px] h-9 w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview" className="text-xs">
                  <Film className="h-3.5 w-3.5 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="trigger" className="text-xs">
                  <Zap className="h-3.5 w-3.5 mr-1 text-[#635BDB]" />
                  Comment Trigger
                </TabsTrigger>
                <TabsTrigger value="simulator" className="text-xs">
                  <PlayCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Test Simulator
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-xs">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Comments ({reel.comments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">
                  <History className="h-3.5 w-3.5 mr-1" />
                  Activity History
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="m-0 focus-visible:outline-none space-y-6">
              {/* Media Preview Card */}
              <Card className="border-[#E2E8F0] overflow-hidden">
                <div className="aspect-[16/9] w-full bg-[#1E293B] relative flex items-center justify-center">
                  <img src={placeholder} alt={reel.caption} className="h-full w-full object-cover" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Post ID: {reel.instagramPostId}</span>
                  </div>
                  <a
                    href={reel.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#1E293B] hover:text-[#635BDB] px-3 py-1.5 rounded-[6px] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Reel on Instagram</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <CardContent className="p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Caption &amp; Call To Action Hook
                  </h4>
                  <p className="text-xs text-[#1E293B] leading-relaxed p-3.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC]">
                    {reel.caption}
                  </p>
                </CardContent>
              </Card>

              {/* Attribution Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-[10px] bg-white border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Triggers</span>
                  <span className="text-lg font-bold text-[#1E293B] mt-0.5 block">
                    {formatNumber(reel.triggerCount)}
                  </span>
                </div>
                <div className="p-4 rounded-[10px] bg-white border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">DMs Sent</span>
                  <span className="text-lg font-bold text-[#1E293B] mt-0.5 block">
                    {formatNumber(reel.dmsSent)}
                  </span>
                </div>
                <div className="p-4 rounded-[10px] bg-white border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Link Clicks</span>
                  <span className="text-lg font-bold text-[#635BDB] mt-0.5 block">
                    {formatNumber(reel.linkClicks)}
                  </span>
                </div>
                <div className="p-4 rounded-[10px] bg-white border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Conversions</span>
                  <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
                    {reel.conversions} orders
                  </span>
                </div>
              </div>

              {/* Assign Automation Workflow Card */}
              <Card className="border-[#C7D2FE] bg-[#EEF2FF]/40">
                <CardHeader className="p-4 pb-2 border-b border-[#C7D2FE]/60">
                  <CardTitle className="text-xs font-bold text-[#635BDB] flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    <span>Assign Automation Workflow</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Select
                    value={assignedAutomationId}
                    onValueChange={handleAssignAutomation}
                    disabled={assignMutation.isPending}
                  >
                    <SelectTrigger className="h-9 bg-white text-xs">
                      <SelectValue placeholder="Select an automation workflow..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No automation assigned (Disabled)</SelectItem>
                      {automationsList.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-[#64748B]">
                    Selecting an automation binds this Reel to an existing workflow rule, or configure custom keywords directly in the Comment Trigger tab.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Comment Trigger Form */}
            <TabsContent value="trigger" className="m-0 focus-visible:outline-none">
              <CommentTriggerForm reel={reel} />
            </TabsContent>

            {/* Tab 3: Test Simulator */}
            <TabsContent value="simulator" className="m-0 focus-visible:outline-none">
              <CommentSimulator reel={reel} />
            </TabsContent>

            {/* Tab 4: Reel Comments Feed */}
            <TabsContent value="comments" className="m-0 focus-visible:outline-none">
              <ReelCommentsFeed reel={reel} />
            </TabsContent>

            {/* Tab 5: Activity History */}
            <TabsContent value="activity" className="m-0 focus-visible:outline-none space-y-3">
              <Card className="border-[#E2E8F0]">
                <CardHeader className="p-5 pb-3 border-b border-[#F1F5F9]">
                  <CardTitle className="text-sm font-bold text-[#1E293B]">
                    Recent DM Automation Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-[#F1F5F9]">
                  {!reel.activity || reel.activity.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#64748B]">
                      No recent DM activity recorded for this Reel yet.
                    </div>
                  ) : (
                    reel.activity.map((act) => (
                      <div key={act.id} className="p-4 flex items-center justify-between text-xs gap-3">
                        <div className="min-w-0">
                          <span className="font-bold text-[#1E293B] block truncate">
                            {act.username}
                          </span>
                          <span className="text-[11px] text-[#64748B] line-clamp-1">
                            {act.message}
                          </span>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <span className="text-[10px] text-[#94A3B8] block">
                            {formatRelativeTime(act.sentTime)}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              act.clickStatus === "clicked"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-[#EEF2FF] text-[#635BDB]"
                            }`}
                          >
                            {act.clickStatus === "clicked" ? "Link Clicked" : "Delivered"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Summary Column (1 span) */}
        <div className="space-y-6">
          {/* Conversion Funnel Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Conversion Funnel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64748B]">Click-Through Rate (CTR)</span>
                <span className="font-bold text-[#635BDB]">{ctr}%</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#635BDB] h-full rounded-full" style={{ width: `${Math.min(ctr, 100)}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-[#64748B]">Order Conversion Rate</span>
                <span className="font-bold text-emerald-600">{convRate}%</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(convRate, 100)}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Trigger Summary Card */}
          <Card className="border-[#E2E8F0]">
            <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#635BDB]" />
                <span>Trigger Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#64748B] block mb-1">Active Comment Keywords</span>
                <div className="flex flex-wrap gap-1">
                  {reel.triggerKeywords && reel.triggerKeywords.length > 0 ? (
                    reel.triggerKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#635BDB] border border-[#C7D2FE]/60"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#94A3B8]">No keywords set</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                <span>Match Type</span>
                <span className="font-semibold text-[#1E293B] capitalize">
                  {reel.matchType || "contains"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#64748B]">
                <span>Once Per User</span>
                <span className="font-semibold text-[#1E293B]">
                  {reel.sendOncePerUser !== false ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#64748B]">
                <span>Public Reply</span>
                <span className="font-semibold text-[#1E293B]">
                  {reel.publicReplyEnabled ? "Active" : "Disabled"}
                </span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("trigger")}
                  className="w-full text-xs h-8"
                >
                  Configure Trigger
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Linked Product Card */}
          {reel.product && (
            <Card className="border-[#E2E8F0]">
              <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-[#635BDB]" />
                  <span>Featured Product</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1E293B] text-sm">{reel.product.name}</span>
                  <span className="font-bold text-[#635BDB]">{formatINR(reel.product.price)}</span>
                </div>
                <p className="text-[11px] text-[#64748B]">SKU: {reel.product.sku}</p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full text-xs h-8">
                    <Link href={`/products/${reel.product.id}`}>View Product Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Automation Workflow Card */}
          {reel.automation && (
            <Card className="border-[#E2E8F0]">
              <CardHeader className="p-4 pb-2 border-b border-[#F1F5F9]">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#635BDB]" />
                  <span>Linked Automation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <p className="font-bold text-[#1E293B]">{reel.automation.name}</p>
                <p className="text-[11px] text-[#64748B]">
                  Executions: {formatNumber(reel.automation.executions)} • Messages: {formatNumber(reel.automation.messagesSent)}
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full text-xs h-8">
                    <Link href={`/automations/${reel.automation.id}`}>Open Workflow Builder</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReelDetailPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading Reel..." />}>
      <ReelDetailContent />
    </Suspense>
  );
}
