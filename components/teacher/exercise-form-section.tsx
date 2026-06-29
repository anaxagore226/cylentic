import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ExerciseFormSectionProps {
  step?: number;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ExerciseFormSection({
  step,
  title,
  description,
  icon,
  children,
  className,
}: ExerciseFormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-card-border bg-card/40 p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {step != null ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            {step}
          </span>
        ) : icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            {icon}
          </span>
        ) : null}
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
