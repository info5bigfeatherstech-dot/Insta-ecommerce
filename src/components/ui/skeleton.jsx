import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-[6px] bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
