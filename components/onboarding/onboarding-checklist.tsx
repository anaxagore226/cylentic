import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { OnboardingStatus } from "@/lib/types/onboarding";

export function OnboardingChecklist({
  status,
}: {
  status: OnboardingStatus;
}) {
  const pending = status.steps.filter(
    (s) => s.required && !s.completed && s.id !== "complete",
  );

  return (
    <Card className="mb-6 border-accent/30 bg-accent/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Configuration en cours</h2>
          <p className="mt-1 text-sm text-muted">
            {status.progress}% complété — finalisez la mise en place de votre
            établissement.
          </p>
        </div>
        <Link href="/admin/onboarding">
          <Button size="sm">
            Continuer
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {status.steps
          .filter((s) => s.required && s.id !== "complete")
          .map((step) => (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                step.completed
                  ? "border-accent/20 bg-accent/10 text-accent"
                  : "border-card-border bg-card/50 text-muted",
              )}
            >
              {step.completed ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              )}
              {step.title}
            </li>
          ))}
      </ul>

      {pending.length === 0 && status.canFinish ? (
        <p className="mt-3 text-sm text-accent">
          Toutes les étapes obligatoires sont faites — terminez depuis
          l&apos;assistant de configuration.
        </p>
      ) : null}
    </Card>
  );
}
