"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulateComment, useSimulateLinkClick } from "@/hooks/use-reels";
import { db } from "@/data/db";
import {
  Send,
  Sparkles,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
  Clock,
  Instagram,
  User,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export function CommentSimulator({ reel }) {
  const simulateCommentMutation = useSimulateComment();
  const simulateLinkClickMutation = useSimulateLinkClick();

  // Mock customers list from DB for quick selection
  const customers = db.state.customers.slice(0, 15);

  const [selectedUserMode, setSelectedUserMode] = React.useState(
    customers[0]?.username || "@priya_sharma_98"
  );
  const [customUsername, setCustomUsername] = React.useState("");
  const [commentText, setCommentText] = React.useState("");

  // History of simulation events in this session
  const [simulationHistory, setSimulationHistory] = React.useState([]);

  const activeUsername =
    selectedUserMode === "custom"
      ? customUsername || "@new_shopper_india"
      : selectedUserMode;

  const handlePostComment = async (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    const res = await simulateCommentMutation.mutateAsync({
      reelId: reel.id,
      username: activeUsername,
      commentText: commentText.trim(),
    });

    if (res && res.data) {
      setSimulationHistory((prev) => [
        {
          id: `sim_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          userComment: commentText.trim(),
          username: activeUsername,
          status: res.status, // "match" | "no_trigger" | "skipped_duplicate" | "skipped_inactive"
          sentDm: res.data.sentDm || null,
          publicReply: res.data.publicReply || null,
          isClicked: false,
        },
        ...prev,
      ]);
    }

    setCommentText("");
  };

  const handleSimulateClick = async (eventIndex, dmActivityId) => {
    if (!dmActivityId) return;

    await simulateLinkClickMutation.mutateAsync({
      dmActivityId,
      reelId: reel.id,
    });

    setSimulationHistory((prev) =>
      prev.map((item, idx) =>
        idx === eventIndex ? { ...item, isClicked: true } : item
      )
    );
  };

  const quickKeyword =
    reel.triggerKeywords && reel.triggerKeywords.length > 0
      ? reel.triggerKeywords[0]
      : reel.triggerKeyword || "LINK";

  return (
    <div className="space-y-5">
      {/* Simulation Info Card */}
      <div className="p-4 rounded-[12px] bg-[#EEF2FF]/60 border border-[#C7D2FE]/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#635BDB] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Interactive Comment-to-DM Simulator</span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Ready to test
          </span>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          Simulate followers commenting on this Reel. Post a comment matching your keywords (e.g. &quot;{quickKeyword}&quot;) to verify customer creation, Inbox delivery, DM Activity logging, and link attribution.
        </p>
      </div>

      {/* Simulator Control Panel */}
      <div className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold text-[#1E293B]">1. Choose Simulated Follower</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B]">Select Existing Customer</label>
            <Select
              value={selectedUserMode}
              onValueChange={(val) => setSelectedUserMode(val)}
            >
              <SelectTrigger className="h-9 text-xs bg-[#F8FAFC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.username}>
                    {c.username} ({c.name})
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Type New Instagram User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUserMode === "custom" && (
            <div className="space-y-1 animate-in fade-in">
              <label className="text-[11px] font-semibold text-[#64748B]">New Instagram Username</label>
              <Input
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="@shopper_mumbai"
                className="h-9 text-xs"
              />
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="space-y-2 pt-1 border-t border-[#F1F5F9]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1E293B]">2. Follower Comment</label>
            {reel.triggerKeywords && reel.triggerKeywords.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-[#64748B]">Quick fill:</span>
                {reel.triggerKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setCommentText(kw)}
                    className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#635BDB] font-bold hover:bg-[#E0E7FF] transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handlePostComment} className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Type a comment (e.g. "${quickKeyword} please!" or "Love this 😍")`}
              className="text-xs h-10"
            />
            <Button
              type="submit"
              disabled={simulateCommentMutation.isPending || !commentText.trim()}
              className="bg-[#635BDB] hover:bg-[#5349C9] text-white text-xs h-10 px-4 font-semibold shrink-0 gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{simulateCommentMutation.isPending ? "Posting..." : "Post Comment"}</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Live Simulation Feed / Mini Chat */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Simulated Activity Log ({simulationHistory.length} Test Events)
          </h4>
          {simulationHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setSimulationHistory([])}
              className="text-[11px] text-[#64748B] hover:text-[#1E293B] underline"
            >
              Clear log
            </button>
          )}
        </div>

        {simulationHistory.length === 0 ? (
          <div className="p-8 text-center rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
            <MessageSquare className="h-8 w-8 text-[#94A3B8] mx-auto opacity-60" />
            <p className="text-xs font-medium text-[#64748B]">
              No test comments posted yet in this session.
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              Type a comment above like &quot;{quickKeyword}&quot; and tap &quot;Post Comment&quot; to test the live trigger!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {simulationHistory.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white shadow-2xs space-y-3"
              >
                {/* Event Header with Status Badge */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-[#635BDB] text-white text-[10px] font-bold">
                        {getInitials(item.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-[#1E293B]">{item.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                    {item.status === "match" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        DM Sent
                      </span>
                    ) : item.status === "no_trigger" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        No Trigger
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Skipped
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. User Comment Bubble */}
                <div className="flex justify-start items-start gap-2">
                  <div className="bg-[#F1F5F9] text-[#1E293B] rounded-[12px] rounded-tl-[2px] px-3.5 py-2 max-w-[85%] text-xs shadow-2xs">
                    <p className="font-medium">{item.userComment}</p>
                    <span className="text-[9px] text-[#94A3B8] block mt-0.5">Follower comment</span>
                  </div>
                </div>

                {/* 2. Public Reply (if generated) */}
                {item.publicReply && (
                  <div className="ml-5 flex justify-start items-start gap-2">
                    <div className="bg-[#ECFDF5] border border-emerald-200 text-emerald-900 rounded-[12px] rounded-tl-[2px] px-3.5 py-2 max-w-[85%] text-xs shadow-2xs">
                      <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">
                        Brand Public Reply:
                      </span>
                      <p>{item.publicReply}</p>
                    </div>
                  </div>
                )}

                {/* 3. Outgoing Automated DM (if matched) */}
                {item.sentDm && (
                  <div className="flex justify-end">
                    <div className="bg-[#EEF2FF] border border-[#C7D2FE] text-[#1E293B] rounded-[16px] rounded-tr-[2px] p-3.5 max-w-[90%] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] text-[#635BDB] font-semibold">
                        <span>⚡ Automated Instagram Direct Message</span>
                        <span>Delivered</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {item.sentDm.text}
                      </p>

                      {/* Simulate Link Click Action */}
                      <div className="pt-1 flex items-center justify-between gap-2 border-t border-[#C7D2FE]/60">
                        <span className="text-[10px] text-[#64748B] truncate">
                          Link: {item.sentDm.productUrl}
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          disabled={item.isClicked || simulateLinkClickMutation.isPending}
                          onClick={() => handleSimulateClick(idx, item.sentDm.dmActivityId)}
                          className={`h-7 px-3 text-[11px] font-semibold shrink-0 gap-1.5 shadow-xs ${
                            item.isClicked
                              ? "bg-emerald-600 text-white cursor-default"
                              : "bg-[#635BDB] hover:bg-[#5349C9] text-white"
                          }`}
                        >
                          {item.isClicked ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Clicked! (+1 Click Tracked)</span>
                            </>
                          ) : (
                            <>
                              <MousePointerClick className="h-3 w-3" />
                              <span>Simulate Link Click</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer simulation notice */}
      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] flex items-center gap-2 text-xs text-[#64748B]">
        <AlertCircle className="h-4 w-4 text-[#635BDB] shrink-0" />
        <span>
          Simulation only. In production, follower comments arrive via real-time Instagram Graph API Webhooks.
        </span>
      </div>
    </div>
  );
}
