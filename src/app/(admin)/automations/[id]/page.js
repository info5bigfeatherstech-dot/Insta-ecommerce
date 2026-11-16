"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAutomation, useUpdateAutomation } from "@/hooks/use-automations";
import { WorkflowBuilder } from "@/components/automations/workflow-builder";
import { LoadingState } from "@/components/shared/loading-state";

function EditAutomationContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { data: automation, isLoading } = useAutomation(id);
  const updateMutation = useUpdateAutomation();

  if (isLoading || !automation) {
    return <LoadingState text="Loading automation workflow canvas..." />;
  }

  const handleSave = async (payload) => {
    await updateMutation.mutateAsync({ id, data: payload });
    router.push("/automations");
  };

  return (
    <WorkflowBuilder
      initialAutomation={automation}
      onSave={handleSave}
      isSaving={updateMutation.isPending}
    />
  );
}

export default function EditAutomationPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading automation workflow canvas..." />}>
      <EditAutomationContent />
    </Suspense>
  );
}
