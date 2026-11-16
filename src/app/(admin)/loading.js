import { LoadingState } from "@/components/shared/loading-state";

export default function AdminLoading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <LoadingState text="Loading dashboard workspace..." />
    </div>
  );
}
