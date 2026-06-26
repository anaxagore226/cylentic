import { cn } from "@/lib/utils/cn";
import type { LabelHTMLAttributes } from "react";

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium", className)}
      style={{ color: "var(--foreground)" }}
      {...props}
    >
      {children}
    </label>
  );
}
