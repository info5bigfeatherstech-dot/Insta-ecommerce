"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplatePicker } from "@/components/automations/editor/template-picker";
import { WorkflowEditor } from "@/components/automations/editor/workflow-editor";
import { useCreateAutomation } from "@/hooks/use-automations";
import { toast } from "sonner";

export default function CreateAutomationPage() {
  const router = useRouter();
  const createMutation = useCreateAutomation();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSaveNew = async (payload) => {
    try {
      const res = await createMutation.mutateAsync(payload);
      toast.success("Automation created successfully");
      if (res?.data?.id) {
        router.push(`/automations/${res.data.id}`);
      } else {
        router.push("/automations");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create automation");
    }
  };

  // If no template chosen yet, show TemplatePicker
  if (!selectedTemplate) {
    return (
      <TemplatePicker
        onSelectTemplate={(tmpl) =>
          setSelectedTemplate({
            name: tmpl.title,
            status: "active",
            workflow: tmpl.workflow,
          })
        }
        onStartBlank={() =>
          setSelectedTemplate({
            name: "Untitled Automation",
            status: "active",
            workflow: { nodes: [], edges: [] },
          })
        }
      />
    );
  }

  // Once template or blank canvas selected, show full n8n canvas editor
  return (
    <WorkflowEditor
      isCreate={true}
      initialAutomation={selectedTemplate}
      onSaveNew={handleSaveNew}
    />
  );
}
