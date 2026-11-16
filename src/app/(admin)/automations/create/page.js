"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WorkflowBuilder } from "@/components/automations/workflow-builder";
import { useCreateAutomation } from "@/hooks/use-automations";

export default function CreateAutomationPage() {
  const router = useRouter();
  const createMutation = useCreateAutomation();

  const handleSave = async (payload) => {
    await createMutation.mutateAsync(payload);
    router.push("/automations");
  };

  return (
    <WorkflowBuilder
      onSave={handleSave}
      isSaving={createMutation.isPending}
    />
  );
}
