"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessagePreview } from "@/components/automations/message-preview";
import { useUpdateReelTrigger } from "@/hooks/use-reels";
import { DEFAULT_PUBLIC_REPLIES } from "@/lib/comment-matcher";
import {
  Zap,
  Plus,
  X,
  AlertTriangle,
  Sparkles,
  Link2,
  MessageSquare,
  ShieldAlert,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const triggerSchema = z
  .object({
    matchType: z.enum(["contains", "exact", "any"]),
    messageTemplate: z.string().min(5, "Message must be at least 5 characters"),
    linkType: z.enum(["product", "custom"]),
    customUrl: z.string().optional(),
    publicReplyEnabled: z.boolean(),
    sendOncePerUser: z.boolean(),
    status: z.enum(["active", "inactive"]),
  })
  .superRefine((data, ctx) => {
    if (data.linkType === "custom") {
      if (!data.customUrl || !data.customUrl.startsWith("http")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customUrl"],
          message: "Please enter a valid URL starting with http:// or https://",
        });
      }
    }
  });

export function CommentTriggerForm({ reel, onSaved }) {
  const updateTriggerMutation = useUpdateReelTrigger();

  // Chips state for keywords
  const [keywords, setKeywords] = React.useState(
    reel.triggerKeywords && reel.triggerKeywords.length > 0
      ? reel.triggerKeywords
      : reel.triggerKeyword
      ? [reel.triggerKeyword]
      : ["LINK"]
  );
  const [keywordInput, setKeywordInput] = React.useState("");

  // Public replies state
  const [publicReplies, setPublicReplies] = React.useState(
    reel.publicReplies && reel.publicReplies.length > 0
      ? reel.publicReplies
      : DEFAULT_PUBLIC_REPLIES
  );
  const [newReplyInput, setNewReplyInput] = React.useState("");
  const [showReplyOptions, setShowReplyOptions] = React.useState(false);

  const textareaRef = React.useRef(null);

  const defaultValues = {
    matchType: reel.matchType || "contains",
    messageTemplate:
      reel.messageTemplate ||
      "Hey {{username}}! ✨ Thank you for loving our {{product_name}}. Here is your exclusive link: {{product_url}}",
    linkType: reel.linkType || "product",
    customUrl: reel.customUrl || "",
    publicReplyEnabled: reel.publicReplyEnabled !== false,
    sendOncePerUser: reel.sendOncePerUser !== false,
    status: reel.status === "inactive" ? "inactive" : "active",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(triggerSchema),
    defaultValues,
  });

  const matchType = watch("matchType");
  const messageTemplate = watch("messageTemplate");
  const linkType = watch("linkType");
  const customUrl = watch("customUrl");
  const publicReplyEnabled = watch("publicReplyEnabled");
  const sendOncePerUser = watch("sendOncePerUser");
  const status = watch("status");

  // Add keyword chip on Enter or comma
  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  const addKeyword = (text) => {
    const trimmed = text.trim().toUpperCase().replace(/,/g, "");
    if (!trimmed) return;
    if (!keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (toRemove) => {
    setKeywords((prev) => prev.filter((k) => k !== toRemove));
  };

  // Insert variable at cursor
  const insertVariable = (variable) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setValue("messageTemplate", (messageTemplate || "") + ` ${variable}`, { shouldDirty: true });
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = messageTemplate || "";
    const updated = current.substring(0, start) + variable + current.substring(end);

    setValue("messageTemplate", updated, { shouldDirty: true });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const hasProductUrlPlaceholder = messageTemplate.includes("{{product_url}}");

  // Form submit handler
  const onSubmit = async (values) => {
    // Validate keywords if matchType is not 'any'
    if (values.matchType !== "any" && keywords.length === 0) {
      toast.error("Please add at least one trigger keyword (e.g. LINK)");
      return;
    }

    // Check product URL availability if linkType === 'product'
    if (values.linkType === "product" && !reel.product?.productUrl) {
      toast.error("Linked product has no URL. Please choose 'Custom URL' instead.");
      return;
    }

    const payload = {
      ...values,
      triggerKeywords: keywords,
      publicReplies: publicReplies,
    };

    const res = await updateTriggerMutation.mutateAsync({
      reelId: reel.id,
      triggerData: payload,
    });

    if (onSaved) onSaved(res.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Active Status Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#E2E8F0] bg-white">
        <div className="space-y-0.5">
          <label className="text-xs font-bold text-[#1E293B]">Trigger Status</label>
          <p className="text-[11px] text-[#64748B]">
            {status === "active"
              ? "Automation is active and actively sending DMs on comments."
              : "Automation is paused. Comments will be recorded as Skipped."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setValue("status", status === "active" ? "inactive" : "active", { shouldDirty: true })}
            className={`h-8 px-3 text-xs font-semibold rounded-full ${
              status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                : "bg-slate-100 text-[#64748B] border-slate-300 hover:bg-slate-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full mr-1.5 ${
                status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {status === "active" ? "Active" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Trigger Keywords & Matching */}
      <div className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#635BDB]" />
              <span>Comment Trigger Keywords</span>
            </h4>
            <p className="text-[11px] text-[#64748B]">
              Keywords followers must comment to receive the automated direct message.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#635BDB] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
            Case-insensitive
          </span>
        </div>

        {/* Match Type Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1E293B]">Match Type</label>
          <Select
            value={matchType}
            onValueChange={(val) => setValue("matchType", val, { shouldDirty: true })}
          >
            <SelectTrigger className="h-9 text-xs bg-[#F8FAFC]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">
                Contains keyword (e.g. &quot;send LINK pls&quot; or &quot;LINK!&quot;)
              </SelectItem>
              <SelectItem value="exact">
                Exact match (Whole comment equals keyword only)
              </SelectItem>
              <SelectItem value="any">
                Any comment (Every follower comment triggers DM)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Keywords Chips Input (hidden if matchType is 'any') */}
        {matchType !== "any" ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E293B]">
              Keywords (Press Enter or comma to add)
            </label>
            <div className="min-h-[42px] p-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center gap-1.5 focus-within:border-[#635BDB] focus-within:ring-1 focus-within:ring-[#635BDB] transition-all">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-[#635BDB] text-white shadow-2xs animate-in fade-in"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                    title="Remove keyword"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={keywords.length === 0 ? "e.g. LINK, PRICE, BUY..." : "Add more..."}
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                onBlur={() => addKeyword(keywordInput)}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-[#1E293B] outline-none px-2 py-1 placeholder:text-[#94A3B8]"
              />
            </div>
            {keywords.length === 0 && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Please enter at least one keyword for this trigger.
              </p>
            )}
            <p className="text-[10px] text-[#94A3B8]">
              Tip: Emojis and punctuation in user comments are automatically stripped during evaluation.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-[8px] border border-amber-200 text-amber-800 text-xs">
            ⚡ &quot;Any comment&quot; mode is active. Every comment posted on this Reel will trigger an automated DM.
          </div>
        )}
      </div>

      {/* DM Message Text & Placeholders */}
      <div className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#635BDB]" />
              <span>Direct Message (DM) Content</span>
            </h4>
            <p className="text-[11px] text-[#64748B]">
              Personalized Instagram DM sent to the user immediately upon comment trigger.
            </p>
          </div>
        </div>

        {/* Variable Insertion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-[#64748B]">Insert variable:</span>
          {[
            { label: "@username", value: "{{username}}" },
            { label: "Product Name", value: "{{product_name}}" },
            { label: "Product Price", value: "{{product_price}}" },
            { label: "Product URL", value: "{{product_url}}" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => insertVariable(item.value)}
              className="px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#EEF2FF] text-[#635BDB] hover:bg-[#E0E7FF] border border-[#C7D2FE]/60 transition-colors"
            >
              + {item.label}
            </button>
          ))}
        </div>

        {/* Message Textarea */}
        <div className="space-y-1">
          <Textarea
            ref={textareaRef}
            rows={4}
            {...register("messageTemplate")}
            placeholder="Hey {{username}}! Tap below to get {{product_name}}: {{product_url}}"
            className="text-xs leading-relaxed"
          />
          {errors.messageTemplate && (
            <p className="text-[11px] text-red-500">{errors.messageTemplate.message}</p>
          )}
        </div>

        {/* Warning if {{product_url}} is missing */}
        {!hasProductUrlPlaceholder && (
          <div className="p-3 bg-amber-50 rounded-[8px] border border-amber-200 flex items-start gap-2 text-amber-800 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold block">Missing Product Link!</span>
              <span>Your DM doesn&apos;t include the product link token. Tap </span>
              <button
                type="button"
                onClick={() => insertVariable("{{product_url}}")}
                className="underline font-bold text-amber-900"
              >
                + Product URL
              </button>
              <span> to add it so followers can click to your store.</span>
            </div>
          </div>
        )}
      </div>

      {/* Link to Send Configuration */}
      <div className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white space-y-3.5 shadow-2xs">
        <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-[#635BDB]" />
          <span>Destination Store Link</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            className={`p-3 rounded-[8px] border cursor-pointer text-xs flex flex-col justify-between transition-all ${
              linkType === "product"
                ? "border-[#635BDB] bg-[#EEF2FF]/40 text-[#1E293B]"
                : "border-[#E2E8F0] bg-white text-[#64748B]"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                value="product"
                checked={linkType === "product"}
                onChange={() => setValue("linkType", "product", { shouldDirty: true })}
                className="text-[#635BDB]"
              />
              <span className="font-semibold text-xs text-[#1E293B]">
                Use Associated Product URL
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-1 truncate">
              {reel.product?.productUrl || "https://urbanstyle.in/products/..."}
            </p>
          </label>

          <label
            className={`p-3 rounded-[8px] border cursor-pointer text-xs flex flex-col justify-between transition-all ${
              linkType === "custom"
                ? "border-[#635BDB] bg-[#EEF2FF]/40 text-[#1E293B]"
                : "border-[#E2E8F0] bg-white text-[#64748B]"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                value="custom"
                checked={linkType === "custom"}
                onChange={() => setValue("linkType", "custom", { shouldDirty: true })}
                className="text-[#635BDB]"
              />
              <span className="font-semibold text-xs text-[#1E293B]">Custom URL / Landing Page</span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Specify custom campaign UTM or bundle link
            </p>
          </label>
        </div>

        {linkType === "custom" && (
          <div className="space-y-1 pt-1">
            <Input
              {...register("customUrl")}
              placeholder="https://urbanstyle.in/special-drop?coupon=REEL20"
              className="text-xs"
            />
            {errors.customUrl && (
              <p className="text-[11px] text-red-500">{errors.customUrl.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Advanced Rules: Public Reply & Send Once */}
      <div className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#635BDB]" />
          <span>Fulfillment Behavior & Public Replies</span>
        </h4>

        {/* Send only once per user */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="space-y-0.5">
            <label className="text-xs font-semibold text-[#1E293B] block">
              Send only once per follower
            </label>
            <p className="text-[11px] text-[#64748B]">
              Prevents duplicate DMs if the follower comments the trigger multiple times.
            </p>
          </div>
          <input
            type="checkbox"
            checked={sendOncePerUser}
            onChange={(e) => setValue("sendOncePerUser", e.target.checked, { shouldDirty: true })}
            className="h-4 w-4 rounded text-[#635BDB] focus:ring-[#635BDB] cursor-pointer mt-1"
          />
        </div>

        <div className="border-t border-[#F1F5F9] pt-3">
          {/* Public Comment Reply Toggle */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-[#1E293B] block">
                Public Reply to Comment
              </label>
              <p className="text-[11px] text-[#64748B]">
                Automatically reply under the commenter&apos;s post (e.g. &quot;Check your DMs! 📩&quot;).
              </p>
            </div>
            <input
              type="checkbox"
              checked={publicReplyEnabled}
              onChange={(e) =>
                setValue("publicReplyEnabled", e.target.checked, { shouldDirty: true })
              }
              className="h-4 w-4 rounded text-[#635BDB] focus:ring-[#635BDB] cursor-pointer mt-1"
            />
          </div>

          {publicReplyEnabled && (
            <div className="mt-3 p-3 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] space-y-2">
              <span className="text-[11px] font-semibold text-[#1E293B] block">
                Reply Variations (Randomly rotated):
              </span>
              <div className="space-y-1.5">
                {publicReplies.map((reply, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded border border-[#E2E8F0]">
                    <span className="text-[#1E293B]">{reply}</span>
                    {publicReplies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPublicReplies(publicReplies.filter((_, idx) => idx !== i))}
                        className="text-[#94A3B8] hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 pt-1">
                <Input
                  value={newReplyInput}
                  onChange={(e) => setNewReplyInput(e.target.value)}
                  placeholder="Add custom reply variation..."
                  className="h-7 text-xs bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newReplyInput.trim()) {
                        setPublicReplies([...publicReplies, newReplyInput.trim()]);
                        setNewReplyInput("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newReplyInput.trim()) {
                      setPublicReplies([...publicReplies, newReplyInput.trim()]);
                      setNewReplyInput("");
                    }
                  }}
                  className="h-7 px-2.5 text-xs text-[#635BDB]"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Phone DM Preview */}
      <div className="p-4 rounded-[12px] border border-[#E2E8F0] bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#1E293B]">Live Follower DM Experience</h4>
          <span className="text-[10px] text-[#64748B]">Simulated Live Preview</span>
        </div>
        <div className="py-2">
          <MessagePreview
            message={messageTemplate}
            product={reel.product}
            buttonText="Shop Now"
            triggerKeyword={keywords[0] || "LINK"}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-[11px] text-[#64748B]">
          Syncs automatically with Automations engine.
        </span>
        <Button
          type="submit"
          disabled={updateTriggerMutation.isPending}
          className="bg-[#635BDB] hover:bg-[#5349C9] text-white text-xs gap-1.5 font-semibold px-5"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{updateTriggerMutation.isPending ? "Saving..." : "Save Trigger Configuration"}</span>
        </Button>
      </div>
    </form>
  );
}
