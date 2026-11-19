"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SITE_CONFIG } from "@/config/site-config";
import { Check, CheckCheck, ExternalLink, Sparkles, AlertCircle } from "lucide-react";

export function MessagePreview({
  message = "",
  product = null,
  buttonText = "Shop Now",
  quickReplies = [],
  triggerKeyword = "BUY",
}) {
  const previewUsername = "priya_sharma_98";
  const productName = product ? product.name : "Featured Product";
  const productPrice = product ? `₹${product.price.toLocaleString("en-IN")}` : "₹1,499";
  const productUrl = product ? product.productUrl : "https://urbanstyle.in/products/item";

  // Replace variable placeholders
  const renderedMessage = message
    .replace(/\{\{username\}\}/g, `@${previewUsername}`)
    .replace(/\{\{product_name\}\}/g, productName)
    .replace(/\{\{product_price\}\}/g, productPrice)
    .replace(/\{\{product_url\}\}/g, productUrl);

  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[24px] border-4 border-foreground/80 dark:border-border bg-card shadow-xl overflow-hidden flex flex-col font-sans">
      {/* Smartphone Notch & Status Bar */}
      <div className="h-6 bg-foreground text-background flex items-center justify-between px-5 text-[10px] font-medium">
        <span>9:41</span>
        <div className="w-16 h-3 bg-background/20 rounded-full" />
        <div className="flex items-center gap-1">
          <span className="text-[9px]">5G</span>
          <div className="w-4 h-2 border border-background/60 rounded-[2px]" />
        </div>
      </div>

      {/* Instagram DM Header */}
      <div className="p-3 border-b border-border bg-card flex items-center gap-2.5">
        <Avatar className="h-7 w-7 border border-border">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px]">
            US
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-foreground truncate">
              {SITE_CONFIG.instagramHandle.replace("@", "")}
            </span>
            <span className="h-2 w-2 rounded-full bg-success" />
          </div>
          <p className="text-[9px] text-muted-foreground">Active now • Automated DM</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-muted/40 p-3 space-y-3 min-h-[280px] max-h-[340px] overflow-y-auto text-xs">
        {/* User Incoming Keyword Trigger Bubble */}
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-[16px] rounded-br-[4px] px-3 py-2 max-w-[80%] shadow-xs">
            <p className="font-medium text-xs">{triggerKeyword || "GOLD"}</p>
            <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-primary-foreground/80">
              <span>9:41 AM</span>
              <CheckCheck className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>

        {/* Automated Outgoing DM Bubble */}
        <div className="flex justify-start items-end gap-1.5">
          <Avatar className="h-5 w-5 mb-1 shrink-0 border border-border">
            <AvatarFallback className="bg-primary text-primary-foreground text-[8px] font-bold">
              US
            </AvatarFallback>
          </Avatar>
          <div className="bg-card border border-border text-card-foreground rounded-[16px] rounded-bl-[4px] p-3 max-w-[85%] shadow-xs space-y-2.5">
            <p className="text-xs leading-relaxed whitespace-pre-wrap">
              {renderedMessage || "Hello! Here is your personalized link..."}
            </p>

            {/* Tap Action Button */}
            <div className="pt-1">
              <button
                type="button"
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-2 px-3 rounded-[8px] text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>{buttonText || "Shop Now"}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t border-border">
              <span>Automated response</span>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Quick Replies chips */}
        {quickReplies && quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 justify-end">
            {quickReplies.map((qr, i) => (
              <span
                key={i}
                className="inline-block bg-card border border-primary/40 text-primary text-[10px] font-medium px-2.5 py-1 rounded-full shadow-2xs"
              >
                {qr}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Simulation note footer */}
      <div className="p-2.5 bg-primary-soft border-t border-primary/20 flex items-center gap-1.5 text-[10px] text-primary">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Frontend simulation preview • Zero live API calls</span>
      </div>
    </div>
  );
}
