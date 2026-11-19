"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReactFlow } from "@xyflow/react";
import { useWorkflowEditorStore } from "@/store/workflow-editor-store";
import { validateWorkflow } from "@/lib/workflow-engine";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Play,
  Save,
  MoreVertical,
  Copy,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export function TopBar({
  automation,
  workflowName,
  setWorkflowName,
  onSave,
  isSaving,
  onExecuteSimulation,
  onToggleActive,
  onDuplicate,
  onDelete,
}) {
  const router = useRouter();
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const {
    activeTab,
    setActiveTab,
    isDirty,
    isSimulating,
    inspectingExecution,
    setInspectingExecution,
  } = useWorkflowEditorStore();

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [checklistOpen, setChecklistOpen] = React.useState(false);
  const nameInputRef = React.useRef(null);

  const isActive = automation?.status === "active";

  // Validate workflow current state
  const validation = React.useMemo(() => {
    const nodes = getNodes();
    const edges = getEdges();
    return validateWorkflow({ nodes, edges });
  }, [getNodes, getEdges, isDirty]);

  // Handle active toggle with validation guardrails
  const handleToggle = () => {
    if (!isActive && !validation.valid) {
      setChecklistOpen(true);
      toast.error("Resolve workflow validation errors before activating.");
      return;
    }
    onToggleActive();
  };

  // Export workflow JSON
  const handleExportJson = () => {
    const workflowData = {
      name: workflowName,
      status: automation?.status || "inactive",
      workflow: {
        nodes: getNodes(),
        edges: getEdges(),
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Workflow exported as JSON");
  };

  // Import workflow JSON
  const handleImportJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.workflow?.nodes && parsed.workflow?.edges) {
            setNodes(parsed.workflow.nodes);
            setEdges(parsed.workflow.edges);
            if (parsed.name) setWorkflowName(parsed.name);
            toast.success("Workflow imported successfully");
          } else {
            toast.error("Invalid workflow JSON format");
          }
        } catch (err) {
          toast.error("Failed to parse JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col shrink-0 bg-white border-b border-[#E2E8F0]">
      {/* Simulation Banner */}
      <div className="bg-[#EEF2FF] border-b border-[#C7D2FE]/60 px-4 py-1.5 flex items-center justify-between text-[11px] text-[#635BDB]">
        <div className="flex items-center gap-1.5 font-medium">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Simulation only. Real Instagram events will arrive from webhooks in production.</span>
        </div>
        <span className="hidden sm:inline-block text-[10px] bg-white/70 px-2 py-0.5 rounded font-bold border border-[#C7D2FE]">
          n8n-Style Workflow Canvas
        </span>
      </div>

      {/* Main Top Bar */}
      <div className="h-14 px-3 sm:px-5 flex items-center justify-between gap-3">
        {/* Left: Back button, Name, Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/automations"
            className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#1E293B] shrink-0 transition-colors"
            title="Back to Automations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Editable Workflow Name */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") setIsEditingName(false);
                }}
                autoFocus
                className="font-bold text-sm sm:text-base text-[#1E293B] border-b border-[#635BDB] px-1 py-0.5 focus:outline-hidden min-w-[140px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="font-bold text-sm sm:text-base text-[#1E293B] hover:text-[#635BDB] truncate text-left transition-colors flex items-center gap-1.5 group"
                title="Click to rename"
              >
                <span className="truncate">{workflowName || "Untitled Automation"}</span>
                <span className="text-[10px] text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity">
                  (Rename)
                </span>
              </button>
            )}

            {/* Status Badge */}
            <StatusBadge status={isActive ? "active" : "inactive"} />

            {/* Unsaved Changes Dot */}
            {isDirty && (
              <span
                className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"
                title="Unsaved changes"
              />
            )}
          </div>
        </div>

        {/* Center: Tabs Switcher (Editor | Executions) */}
        <div className="hidden md:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[8px]">
          <button
            type="button"
            onClick={() => {
              setInspectingExecution(null);
              setActiveTab("editor");
            }}
            className={cn(
              "px-3.5 py-1 rounded-[6px] text-xs font-bold transition-all",
              activeTab === "editor"
                ? "bg-white text-[#635BDB] shadow-2xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            )}
          >
            Canvas Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("executions")}
            className={cn(
              "px-3.5 py-1 rounded-[6px] text-xs font-bold transition-all",
              activeTab === "executions"
                ? "bg-white text-[#635BDB] shadow-2xs"
                : "text-[#64748B] hover:text-[#1E293B]"
            )}
          >
            Executions Log
          </button>
        </div>

        {/* Right: Actions, Active Toggle, Execute Workflow, Save */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Switch Toggle with Validation Guardrails */}
          <div className="flex items-center gap-1.5 sm:border-r border-[#F1F5F9] sm:pr-2.5">
            <Popover open={checklistOpen} onOpenChange={setChecklistOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={handleToggle}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                    isActive ? "bg-emerald-500" : "bg-slate-300"
                  )}
                  title={isActive ? "Deactivate automation" : "Activate automation"}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      isActive ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </PopoverTrigger>

              {/* Validation Checklist Popover */}
              <PopoverContent className="w-80 p-4 space-y-3" align="end">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-xs text-[#1E293B]">Workflow Guardrails</h4>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      validation.valid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    )}
                  >
                    {validation.valid ? "Ready" : "Issues Found"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {validation.errors.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>All validation checks passed. Ready to activate!</span>
                    </div>
                  ) : (
                    validation.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <span className="text-xs font-semibold text-[#64748B] hidden lg:inline">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Execute Workflow CTA Button */}
          <Button
            type="button"
            size="sm"
            onClick={onExecuteSimulation}
            disabled={isSimulating}
            className="h-8 px-3 gap-1.5 text-xs font-bold bg-[#F97316] hover:bg-[#ea580c] text-white shadow-sm"
            title="Execute test run with sample trigger data"
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span className="hidden sm:inline">Execute Workflow</span>
                <span className="sm:hidden">Run</span>
              </>
            )}
          </Button>

          {/* Save Button */}
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className={cn(
              "h-8 px-3.5 text-xs font-semibold gap-1.5 shadow-sm text-white",
              isDirty
                ? "bg-[#635BDB] hover:bg-[#5248c8]"
                : "bg-[#635BDB]/80 hover:bg-[#635BDB]"
            )}
            title="Save workflow (Ctrl+S)"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save</span>
          </Button>

          {/* More Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#64748B] hover:text-[#1E293B]"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={onDuplicate} className="gap-2 cursor-pointer">
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Duplicate Workflow</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJson} className="gap-2 cursor-pointer">
                <Download className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Export JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportJson} className="gap-2 cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Import JSON</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Automation</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
