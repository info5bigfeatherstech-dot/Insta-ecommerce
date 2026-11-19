"use client";

import * as React from "react";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TemplatePicker } from "@/components/automations/editor/template-picker";
import { WorkflowEditor } from "@/components/automations/editor/workflow-editor";
import { WORKFLOW_TEMPLATES } from "@/components/automations/editor/templates";
import { useCreateAutomation } from "@/hooks/use-automations";
import { useSmartBack } from "@/hooks/use-smart-back";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { db } from "@/data/db";
import { toast } from "sonner";

function CreateAutomationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateSlug = searchParams?.get("template");
  const duplicateId = searchParams?.get("duplicate");
  const createMutation = useCreateAutomation();

  const isDuplicate = Boolean(duplicateId);
  const isDraftMode = Boolean(templateSlug || duplicateId);

  // Fallback destination and label
  const fallbackHref = isDuplicate ? "/automations" : "/automations/create";
  const backLabel = isDuplicate ? "Back to Automations" : "Back to templates";

  const { smartBack: pickerBack } = useSmartBack("/automations");
  const { smartBack: editorBack } = useSmartBack(fallbackHref);

  // Resolve template or duplicate draft data without creating any DB records
  const draftWorkflow = useMemo(() => {
    if (!isDraftMode) return null;

    if (duplicateId) {
      const orig = db?.state?.automations?.find((a) => a.id === duplicateId);
      if (orig) {
        return {
          valid: true,
          data: {
            name: `${orig.name} (Copy)`,
            status: "inactive",
            workflow: JSON.parse(JSON.stringify(orig.workflow || { nodes: [], edges: [] })),
            reelId: orig.reelId,
            productId: orig.productId,
          },
        };
      }
      return {
        valid: false,
        error: `Automation with identifier "${duplicateId}" could not be found to duplicate.`,
      };
    }

    if (templateSlug === "blank") {
      return {
        valid: true,
        data: {
          name: "Untitled Automation",
          status: "active",
          workflow: { nodes: [], edges: [] },
        },
      };
    }

    const tmpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateSlug);
    if (tmpl) {
      return {
        valid: true,
        data: {
          name: tmpl.title,
          status: "active",
          workflow: JSON.parse(JSON.stringify(tmpl.workflow)),
        },
      };
    }

    return {
      valid: false,
      error: `Template blueprint "${templateSlug}" does not exist.`,
    };
  }, [isDraftMode, templateSlug, duplicateId]);

  // First save creates the record and moves to /automations/[id] via router.replace
  const handleSaveNew = async (payload) => {
    try {
      const res = await createMutation.mutateAsync(payload);
      toast.success("Automation created successfully");
      if (res?.data?.id) {
        // Move to /automations/[id] using router.replace so history stack is not duplicated
        router.replace(`/automations/${res.data.id}`);
      } else {
        router.replace("/automations");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create automation");
    }
  };

  const handleSelectTemplate = (tmpl) => {
    router.push(`/automations/create?template=${tmpl.id}`);
  };

  const handleStartBlank = () => {
    router.push("/automations/create?template=blank");
  };

  // 1. Template picker view
  if (!isDraftMode) {
    return (
      <TemplatePicker
        onSelectTemplate={handleSelectTemplate}
        onStartBlank={handleStartBlank}
        onBack={pickerBack}
      />
    );
  }

  // 2. Error state for invalid slug / duplicate
  if (!draftWorkflow.valid) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive-soft text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Template Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {draftWorkflow.error}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editorBack()}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{backLabel}</span>
        </Button>
      </div>
    );
  }

  // 3. Draft Canvas Editor
  return (
    <WorkflowEditor
      isCreate={true}
      initialAutomation={draftWorkflow.data}
      onSaveNew={handleSaveNew}
      fallbackHref={fallbackHref}
      backLabel={backLabel}
    />
  );
}

export default function CreateAutomationPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading automation builder..." />}>
      <CreateAutomationContent />
    </Suspense>
  );
}
