"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAutomation } from "@/hooks/use-automations";
import { WorkflowEditor } from "@/components/automations/editor/workflow-editor";
import { LoadingState } from "@/components/shared/loading-state";
import { DetailPageHeader } from "@/components/shared/detail-page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

function EditAutomationContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  React.useEffect(() => {
    if (id === "new") {
      router.replace("/automations/create");
    }
  }, [id, router]);

  const isValidId = Boolean(id && id !== "new");
  const { data: automation, isLoading, error } = useAutomation(isValidId ? id : null);

  if (id === "new") {
    return <LoadingState text="Redirecting to automation builder..." />;
  }

  if (isLoading) {
    return <LoadingState text="Loading automation workflow canvas..." />;
  }

  if (error || !automation) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-[#1E293B]">Automation Not Found</h2>
        <p className="text-xs text-[#64748B]">
          The automation with ID "{id}" could not be found or has been deleted.
        </p>
        <Link href="/automations">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Automations</span>
          </Button>
        </Link>
      </div>
    );
  }

  return <WorkflowEditor initialAutomation={automation} />;
}

export default function EditAutomationPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading automation workflow canvas..." />}>
      <EditAutomationContent />
    </Suspense>
  );
}
