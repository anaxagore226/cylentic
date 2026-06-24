import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "bg-white/5 text-muted border-card-border",
  success: "bg-accent/10 text-accent border-accent/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-danger/10 text-danger border-danger/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
