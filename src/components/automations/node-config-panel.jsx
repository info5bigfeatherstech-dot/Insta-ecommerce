"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AUTOMATION_TRIGGERS } from "@/lib/constants";
import { db } from "@/data/db";
import { Sparkles, HelpCircle, Tag, Plus, X } from "lucide-react";

export function NodeConfigPanel({
  activeNodeId,
  formData,
  onChange,
}) {
  const products = db.state.products;
  const reels = db.state.reels;
  const tags = db.state.tags;

  const [newQuickReply, setNewQuickReply] = React.useState("");

  const handleAddQuickReply = () => {
    if (!newQuickReply.trim()) return;
    const current = formData.quickReplies || [];
    onChange("quickReplies", [...current, newQuickReply.trim()]);
    setNewQuickReply("");
  };

  const handleRemoveQuickReply = (idx) => {
    const current = formData.quickReplies || [];
    onChange(
      "quickReplies",
      current.filter((_, i) => i !== idx)
    );
  };

  const insertPlaceholder = (token) => {
    const current = formData.messageTemplate || "";
    onChange("messageTemplate", `${current} ${token}`);
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-5 space-y-5 shadow-xs">
      {/* Node 1: Instagram Trigger */}
      {activeNodeId === "trigger" && (
        <div className="space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">1. Instagram Trigger Config</h3>
            <p className="text-xs text-[#64748B]">Choose how user interactions initiate this flow</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Trigger Event Type *</label>
            <Select
              value={formData.triggerType}
              onValueChange={(val) => onChange("triggerType", val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select trigger event" />
              </SelectTrigger>
              <SelectContent>
                {AUTOMATION_TRIGGERS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Keyword Trigger *</label>
            <Input
              value={formData.triggerKeyword}
              onChange={(e) => onChange("triggerKeyword", e.target.value.toUpperCase())}
              placeholder="e.g. GOLD, RUN, MUG, DISCOUNT"
              className="uppercase font-bold tracking-wider text-xs"
            />
            <p className="text-[10px] text-[#64748B]">
              Case-insensitive keyword match in public Reel comments or private DMs.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Connected Reel (Optional)</label>
            <Select
              value={formData.reelId || "none"}
              onValueChange={(val) => onChange("reelId", val === "none" ? null : val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Reel to monitor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any Reel / General DM</SelectItem>
                {reels.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.instagramPostId} - {r.caption.slice(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="replyPublic"
              checked={formData.replyToCommentPublicly}
              onCheckedChange={(val) => onChange("replyToCommentPublicly", val)}
            />
            <label
              htmlFor="replyPublic"
              className="text-xs font-medium text-[#1E293B] cursor-pointer"
            >
              Auto-reply to public comment ("Check your DMs! 📩")
            </label>
          </div>
        </div>
      )}

      {/* Node 2: Identify Contact */}
      {activeNodeId === "identify_contact" && (
        <div className="space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">2. Contact Identification</h3>
            <p className="text-xs text-[#64748B]">Sync Instagram profile data with CRM records</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-2">
              <Checkbox id="c1" defaultChecked disabled />
              <label htmlFor="c1" className="text-[#1E293B] font-medium">
                Capture Instagram handle & numerical User ID
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="c2" defaultChecked disabled />
              <label htmlFor="c2" className="text-[#1E293B] font-medium">
                Auto-create customer record if first interaction
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="c3" defaultChecked disabled />
              <label htmlFor="c3" className="text-[#1E293B] font-medium">
                Record interaction timestamp and attribution source
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Node 3: Find Product */}
      {activeNodeId === "find_product" && (
        <div className="space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">3. Product Catalog Matching</h3>
            <p className="text-xs text-[#64748B]">Bind the promotion to an inventory SKU</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Select Product SKU *</label>
            <Select
              value={formData.productId}
              onValueChange={(val) => onChange("productId", val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Choose product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (₹{p.price.toLocaleString("en-IN")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Promotional Coupon Code</label>
            <Input
              value={formData.discountCode || ""}
              onChange={(e) => onChange("discountCode", e.target.value.toUpperCase())}
              placeholder="e.g. VIP15"
              className="uppercase font-semibold text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="stockCheck"
              checked={formData.checkStock !== false}
              onCheckedChange={(val) => onChange("checkStock", val)}
            />
            <label htmlFor="stockCheck" className="text-xs font-medium text-[#1E293B] cursor-pointer">
              Validate real-time inventory before sending checkout link
            </label>
          </div>
        </div>
      )}

      {/* Node 4: Send Instagram DM */}
      {activeNodeId === "send_dm" && (
        <div className="space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">4. Direct Message Copy & CTA</h3>
            <p className="text-xs text-[#64748B]">
              Configure personalized variables and interactive buttons
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1E293B]">DM Text Message *</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertPlaceholder("{{username}}")}
                  className="text-[10px] bg-[#EEF2FF] text-[#635BDB] px-1.5 py-0.5 rounded font-medium hover:bg-[#E0E7FF]"
                >
                  + Username
                </button>
                <button
                  type="button"
                  onClick={() => insertPlaceholder("{{product_name}}")}
                  className="text-[10px] bg-[#EEF2FF] text-[#635BDB] px-1.5 py-0.5 rounded font-medium hover:bg-[#E0E7FF]"
                >
                  + Product
                </button>
                <button
                  type="button"
                  onClick={() => insertPlaceholder("{{product_price}}")}
                  className="text-[10px] bg-[#EEF2FF] text-[#635BDB] px-1.5 py-0.5 rounded font-medium hover:bg-[#E0E7FF]"
                >
                  + Price
                </button>
              </div>
            </div>
            <Textarea
              value={formData.messageTemplate}
              onChange={(e) => onChange("messageTemplate", e.target.value)}
              rows={4}
              placeholder="Hey {{username}}! Tap below to grab {{product_name}}..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">CTA Button Label *</label>
            <Input
              value={formData.buttonText || "Shop Now"}
              onChange={(e) => onChange("buttonText", e.target.value)}
              placeholder="e.g. Shop at 15% OFF"
            />
          </div>

          {/* Quick Replies Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Quick Reply Suggestions</label>
            <div className="flex gap-2">
              <Input
                value={newQuickReply}
                onChange={(e) => setNewQuickReply(e.target.value)}
                placeholder="e.g. Size guide, Return policy"
                className="text-xs"
              />
              <Button type="button" size="sm" onClick={handleAddQuickReply} className="h-9 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.quickReplies || []).map((qr, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] bg-[#F1F5F9] text-[#1E293B] px-2 py-0.5 rounded-[4px]"
                >
                  <span>{qr}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemoveQuickReply(i)}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Node 5: Track Link Click */}
      {activeNodeId === "track_click" && (
        <div className="space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">5. Attribution & UTM Tracking</h3>
            <p className="text-xs text-[#64748B]">Analytics tags attached to the store link</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">UTM Campaign</label>
            <Input
              value={formData.utmCampaign || "instagram_automation"}
              onChange={(e) => onChange("utmCampaign", e.target.value)}
              placeholder="e.g. feb_flash_drop"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">UTM Medium</label>
            <Input value="instagram_dm" disabled className="bg-[#F8FAFC]" />
          </div>
        </div>
      )}

      {/* Node 6: Update Contact Activity */}
      {activeNodeId === "update_activity" && (
        <div className="space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-bold text-[#1E293B]">6. CRM & Customer Journey</h3>
            <p className="text-xs text-[#64748B]">Update tags, segments, and journey events</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E293B]">Auto-Assign Tags</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {tags.map((t) => {
                const isSelected = (formData.assignedTags || []).includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-2 p-2 rounded-[6px] border cursor-pointer ${
                      isSelected
                        ? "border-[#635BDB] bg-[#EEF2FF] text-[#635BDB] font-semibold"
                        : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {
                        const current = formData.assignedTags || [];
                        if (isSelected) {
                          onChange(
                            "assignedTags",
                            current.filter((id) => id !== t.id)
                          );
                        } else {
                          onChange("assignedTags", [...current, t.id]);
                        }
                      }}
                    />
                    <span className="truncate">{t.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
