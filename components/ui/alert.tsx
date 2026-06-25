import { cn } from "@/lib/utils/cn";

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}) {
  const styles = {
    info: "border-card-border bg-surface-subtle text-muted",
    success: "border-accent/30 bg-accent/10 text-accent",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    error: "border-danger/30 bg-danger/10 text-danger",
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        styles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
