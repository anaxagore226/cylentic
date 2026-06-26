"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  GraduationCap,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AcademicYearForm } from "@/components/admin/academic-year-form";
import { ClassForm } from "@/components/admin/class-form";
import { TeacherForm } from "@/components/admin/teacher-form";
import { StudentForm } from "@/components/admin/student-form";
import { cn } from "@/lib/utils/cn";
import type { OnboardingStatus } from "@/lib/types/onboarding";
import type { OnboardingStepId } from "@/lib/constants/onboarding";
import { ONBOARDING_STEP_IDS } from "@/lib/constants/onboarding";

const STEP_ICONS: Partial<Record<OnboardingStepId, typeof Sparkles>> = {
  welcome: Sparkles,
  academic_year: GraduationCap,
  classes: School,
  teachers: Users,
  students: Users,
  complete: Check,
};

interface OnboardingWizardProps {
  initialStatus: OnboardingStatus;
  userName: string;
}

export function OnboardingWizard({
  initialStatus,
  userName,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("welcome");
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const currentIndex = ONBOARDING_STEP_IDS.indexOf(currentStep);

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/onboarding");
    const json = await res.json();
    if (json.success) setStatus(json.data);
    return json;
  }, []);

  function goNext() {
    const next = ONBOARDING_STEP_IDS[currentIndex + 1];
    if (next) setCurrentStep(next);
  }

  function goBack() {
    const prev = ONBOARDING_STEP_IDS[currentIndex - 1];
    if (prev) setCurrentStep(prev);
  }

  async function handleFinish() {
    setError("");
    setFinishing(true);
    try {
      const res = await fetch("/api/onboarding", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de terminer la configuration.");
    } finally {
      setFinishing(false);
    }
  }

  async function handleStepSuccess() {
    const json = await refreshStatus();
    if (!json.success) return;

    const step = json.data.steps.find(
      (s: { id: string; completed: boolean }) => s.id === currentStep,
    );
    if (step?.completed && currentStep !== "complete") {
      goNext();
    }
  }

  const stepMeta = status.steps.find((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-card-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size={32} />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {userName}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:py-12">
        <div className="mb-8">
          <p className="text-sm text-accent">Configuration initiale</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Bienvenue sur Cylentic, {status.establishment.name}
          </h1>
          <p className="mt-2 text-muted">
            Complétez ces étapes pour préparer votre premier examen sécurisé.
          </p>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted">Progression</span>
              <span className="font-medium text-accent">{status.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <nav className="hidden lg:block">
            <ol className="space-y-2">
              {status.steps.map((step, index) => {
                const Icon = STEP_ICONS[step.id] ?? ChevronRight;
                const active = step.id === currentStep;
                const done = step.completed;

                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-accent/40 bg-accent/10"
                          : "border-card-border bg-card/40 hover:border-accent/20",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                          done
                            ? "bg-accent text-white"
                            : active
                              ? "bg-accent/20 text-accent"
                              : "bg-surface-subtle text-muted",
                        )}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">
                          {step.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {step.required ? "Obligatoire" : "Optionnel"}
                          {step.count != null && step.count > 0
                            ? ` · ${step.count}`
                            : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <Card className="min-h-[420px]">
            <div className="mb-6 border-b border-card-border pb-4">
              <h2 className="text-xl font-semibold">{stepMeta?.title}</h2>
              <p className="mt-1 text-sm text-muted">{stepMeta?.description}</p>
            </div>

            {currentStep === "welcome" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                  <p className="font-medium">
                    Établissement {status.establishment.acronym}
                  </p>
                  {status.subscription ? (
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      <li>
                        Plan :{" "}
                        <strong className="text-foreground">
                          {status.subscription.planName}
                        </strong>
                      </li>
                      {status.subscription.trialEndsAt ? (
                        <li>
                          Essai jusqu&apos;au{" "}
                          {new Date(
                            status.subscription.trialEndsAt,
                          ).toLocaleDateString("fr-FR")}
                        </li>
                      ) : null}
                      {status.subscription.isSimulated ? (
                        <li>Paiement en cours d&apos;intégration (mode démo)</li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  En quelques minutes, vous configurerez votre année
                  académique, vos classes, vos professeurs et pourrez ajouter
                  vos étudiants. Les identifiants générés pourront être
                  communiqués avant le premier examen.
                </p>
              </div>
            )}

            {currentStep === "academic_year" && (
              <div className="space-y-4">
                {status.steps.find((s) => s.id === "academic_year")?.completed ? (
                  <Alert variant="success">
                    {status.steps.find((s) => s.id === "academic_year")?.count}{" "}
                    année(s) académique(s) configurée(s). Vous pouvez en ajouter
                    une autre si besoin.
                  </Alert>
                ) : null}
                <AcademicYearForm onSuccess={handleStepSuccess} />
              </div>
            )}

            {currentStep === "classes" && (
              <div className="space-y-4">
                {status.steps.find((s) => s.id === "classes")?.completed ? (
                  <Alert variant="success">
                    {status.steps.find((s) => s.id === "classes")?.count} classe(s)
                    enregistrée(s).
                  </Alert>
                ) : null}
                <ClassForm onSuccess={handleStepSuccess} />
              </div>
            )}

            {currentStep === "teachers" && (
              <div className="space-y-4">
                {status.steps.find((s) => s.id === "teachers")?.completed ? (
                  <Alert variant="success">
                    {status.steps.find((s) => s.id === "teachers")?.count}{" "}
                    professeur(s) actif(s).
                  </Alert>
                ) : null}
                <TeacherForm embedded onSuccess={handleStepSuccess} />
              </div>
            )}

            {currentStep === "students" && (
              <div className="space-y-4">
                {status.steps.find((s) => s.id === "students")?.completed ? (
                  <Alert variant="success">
                    {status.steps.find((s) => s.id === "students")?.count}{" "}
                    étudiant(s) enregistré(s).
                  </Alert>
                ) : (
                  <Alert>
                    Cette étape est optionnelle. Vous pourrez importer ou créer
                    des étudiants plus tard depuis le menu Étudiants.
                  </Alert>
                )}
                <StudentForm embedded onSuccess={handleStepSuccess} />
              </div>
            )}

            {currentStep === "complete" && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {status.steps
                    .filter((s) => s.id !== "welcome" && s.id !== "complete")
                    .map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 rounded-xl border border-card-border px-4 py-3"
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            step.completed
                              ? "bg-accent/15 text-accent"
                              : "bg-surface-subtle text-muted",
                          )}
                        >
                          {step.completed ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            "—"
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted">
                            {step.completed
                              ? "Terminé"
                              : step.required
                                ? "À compléter"
                                : "Optionnel"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {!status.canFinish ? (
                  <Alert variant="warning">
                    Pour terminer, configurez au minimum une année académique,
                    une classe et un professeur.
                  </Alert>
                ) : (
                  <Alert variant="success">
                    Votre espace est prêt. Accédez au tableau de bord pour
                    gérer vos examens.
                  </Alert>
                )}

                {error ? <Alert variant="error">{error}</Alert> : null}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={currentIndex === 0}
              >
                Retour
              </Button>

              <div className="flex flex-wrap gap-2">
                {currentStep === "students" ? (
                  <Button type="button" variant="secondary" onClick={goNext}>
                    Passer cette étape
                  </Button>
                ) : null}

                {currentStep === "complete" ? (
                  <Button
                    type="button"
                    onClick={handleFinish}
                    loading={finishing}
                    disabled={!status.canFinish}
                  >
                    Accéder au tableau de bord
                  </Button>
                ) : (
                  <Button type="button" onClick={goNext}>
                    Continuer
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
