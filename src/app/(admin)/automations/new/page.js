"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/shared/loading-state";

function NewAutomationRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const destination = qs ? `/automations/create?${qs}` : "/automations/create?template=blank";
    router.replace(destination);
  }, [router, searchParams]);

  return <LoadingState text="Opening workflow canvas..." />;
}

export default function NewAutomationPage() {
  return (
    <Suspense fallback={<LoadingState text="Opening workflow canvas..." />}>
      <NewAutomationRedirectContent />
    </Suspense>
  );
}
