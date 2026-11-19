"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex items-center gap-3 text-sm text-[#64748B]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#635BDB] border-t-transparent" />
        <span>Redirecting to command center...</span>
      </div>
    </div>
  );
}
