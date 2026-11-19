"use client";

import * as React from "react";
import Link from "next/link";
import { WORKFLOW_TEMPLATES } from "./templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Zap,
  ArrowRight,
  Layers,
  MessageSquare,
  Film,
  Clock,
  Split,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplatePicker({ onSelectTemplate, onStartBlank, onBack }) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Automations</span>
              </button>
            ) : (
              <Link
                href="/automations"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Automations</span>
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Create New Automation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a pre-built Instagram commerce blueprint or start with a clean canvas.
          </p>
        </div>

        <Button
          type="button"
          onClick={onStartBlank}
          className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs font-bold text-xs h-10 px-4 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Start from Scratch (Blank)</span>
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Recommended Workflow Templates</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {WORKFLOW_TEMPLATES.length} templates available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Blank Canvas Card */}
          <div
            onClick={onStartBlank}
            className="group relative rounded-[16px] border-2 border-dashed border-border hover:border-primary bg-card hover:bg-primary-soft/20 p-6 flex flex-col justify-between cursor-pointer transition-all shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="h-12 w-12 rounded-[12px] bg-primary-soft text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                Blank Canvas
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Build a custom workflow from the ground up using drag-and-drop triggers, actions, and logic branches.
              </p>
            </div>

            <div className="pt-6 flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              <span>Start blank</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </div>

          {/* Pre-built Templates */}
          {WORKFLOW_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className="group relative rounded-[16px] border border-border hover:border-primary bg-card p-6 flex flex-col justify-between cursor-pointer transition-all shadow-2xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-2 py-0.5 rounded">
                    {tmpl.category}
                  </span>
                  {tmpl.badge && (
                    <span className="text-[10px] font-bold text-warning bg-warning-soft border border-warning-border px-2 py-0.5 rounded-full">
                      {tmpl.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Steps Visual Pill */}
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>{tmpl.workflow.nodes.length} nodes</span>
                  <span>•</span>
                  <span>{tmpl.workflow.edges.length} connections</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-primary">
                <div className="flex items-center gap-1 flex-wrap">
                  {tmpl.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center group-hover:translate-x-1 transition-transform">
                  <span>Use Template</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
