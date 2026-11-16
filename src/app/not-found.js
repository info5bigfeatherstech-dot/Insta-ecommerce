import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#635BDB] mb-4 shadow-xs">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#1E293B] mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-[#64748B] max-w-md mb-6">
        The dashboard view or resource you are looking for does not exist or has been relocated.
      </p>
      <Button asChild size="sm" className="gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </Button>
    </div>
  );
}
