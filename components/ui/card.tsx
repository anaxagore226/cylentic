import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-card-border bg-card p-6 shadow-xl shadow-[var(--card-shadow-color)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
