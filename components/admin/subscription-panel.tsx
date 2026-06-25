"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants/plans";
import { cn } from "@/lib/utils/cn";

interface UsageMetric {
  current: number;
  max: number | null;
  percent: number | null;
  level: "ok" | "warning" | "exceeded";
}

interface Overview {
  subscription: {
    status: string;
    isSimulated: boolean;
    trialEndsAt: string | null;
    startedAt: string;
    currentPeriodEnd: string | null;
  };
  plan: {
    code: string;
    name: string;
    priceMin: number | null;
    priceMax: number | null;
    currency: string;
  };
  consumption: {
    teachers: UsageMetric;
    students: UsageMetric;
    examsThisMonth: UsageMetric;
  };
  availablePlans: {
    code: string;
    name: string;
    maxTeachers: number | null;
    maxStudents: number | null;
    maxExamsPerMonth: number | null;
    priceMin: number | null;
    priceMax: number | null;
    currency: string;
    isCurrent: boolean;
    details: {
      label: string;
      description: string;
      highlights: string[];
    } | null;
  }[];
}

function formatPrice(min: number | null, max: number | null, currency: string) {
  if (min == null && max == null) return "Sur devis";
  if (min === 0 && (max === 0 || max == null)) return "Gratuit";
  if (min != null && max != null && min !== max) {
    return `${min.toLocaleString("fr-FR")} – ${max.toLocaleString("fr-FR")} ${currency}`;
  }
  const value = min ?? max ?? 0;
  return `${value.toLocaleString("fr-FR")} ${currency} / mois`;
}

function UsageBar({
  label,
  metric,
}: {
  label: string;
  metric: UsageMetric;
}) {
  const maxLabel = metric.max == null ? "Illimité" : String(metric.max);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span
          className={cn(
            metric.level === "exceeded" && "text-danger font-medium",
            metric.level === "warning" && "text-amber-400 font-medium",
          )}
        >
          {metric.current} / {maxLabel}
          {metric.percent != null ? ` (${metric.percent} %)` : ""}
        </span>
      </div>
      {metric.max != null ? (
        <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              metric.level === "exceeded" && "bg-danger",
              metric.level === "warning" && "bg-amber-400",
              metric.level === "ok" && "bg-accent",
            )}
            style={{ width: `${Math.min(metric.percent ?? 0, 100)}%` }}
          />
        </div>
      ) : (
        <p className="text-xs text-muted">Aucune limite sur ce quota</p>
      )}
    </div>
  );
}

export function SubscriptionPanel() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/subscription");
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Chargement impossible");
        return;
      }
      setData(json.data);
    } catch {
      setError("Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleChangePlan(planCode: string) {
    if (
      !confirm(
        "Changer de plan tarifaire ? Le paiement reste simulé (essai 30 jours).",
      )
    ) {
      return;
    }

    setChanging(planCode);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/billing/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Changement impossible");
        return;
      }
      setData(json.data.overview);
      setSuccess(json.data.message);
      router.refresh();
    } catch {
      setError("Changement impossible");
    } finally {
      setChanging(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Chargement de l&apos;abonnement…</p>;
  }

  if (!data) {
    return error ? <Alert variant="error">{error}</Alert> : null;
  }

  const statusVariant =
    data.subscription.status === "active" || data.subscription.status === "trial"
      ? "success"
      : "danger";

  return (
    <div className="space-y-6">
      {data.subscription.isSimulated ? (
        <Alert variant="info">
          Paiement en cours d&apos;intégration — votre compte est actif en mode
          simulé
          {data.subscription.trialEndsAt
            ? ` jusqu'au ${new Date(data.subscription.trialEndsAt).toLocaleDateString("fr-FR")}`
            : ""}
          .
        </Alert>
      ) : null}

      {success ? <Alert variant="success">{success}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Plan actuel</p>
            <h2 className="text-2xl font-semibold">{data.plan.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {formatPrice(data.plan.priceMin, data.plan.priceMax, data.plan.currency)}
            </p>
          </div>
          <Badge variant={statusVariant}>
            {SUBSCRIPTION_STATUS_LABELS[data.subscription.status] ??
              data.subscription.status}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Début</dt>
            <dd className="font-medium">
              {new Date(data.subscription.startedAt).toLocaleDateString("fr-FR")}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Fin d&apos;essai</dt>
            <dd className="font-medium">
              {data.subscription.trialEndsAt
                ? new Date(data.subscription.trialEndsAt).toLocaleDateString("fr-FR")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Période en cours</dt>
            <dd className="font-medium">
              {data.subscription.currentPeriodEnd
                ? new Date(data.subscription.currentPeriodEnd).toLocaleDateString(
                    "fr-FR",
                  )
                : "—"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="font-semibold">Consommation du plan</h3>
        <p className="mt-1 text-sm text-muted">
          Les alertes s&apos;affichent à 80 % et 100 % des limites.
        </p>
        <div className="mt-6 space-y-5">
          <UsageBar label="Professeurs actifs" metric={data.consumption.teachers} />
          <UsageBar label="Étudiants actifs" metric={data.consumption.students} />
          <UsageBar
            label="Examens créés ce mois"
            metric={data.consumption.examsThisMonth}
          />
        </div>
      </Card>

      <div>
        <h3 className="mb-4 font-semibold">Changer de plan</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.availablePlans.map((plan) => (
            <Card
              key={plan.code}
              className={cn(
                plan.isCurrent && "border-accent/40 ring-1 ring-accent/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold">{plan.name}</h4>
                  <p className="text-sm text-muted">
                    {plan.details?.description ?? plan.code}
                  </p>
                </div>
                {plan.isCurrent ? <Badge variant="success">Actuel</Badge> : null}
              </div>

              <p className="mt-3 font-medium text-accent">
                {formatPrice(plan.priceMin, plan.priceMax, plan.currency)}
              </p>

              <ul className="mt-4 space-y-1 text-sm text-muted">
                <li>
                  {plan.maxTeachers ?? "∞"} professeur
                  {plan.maxTeachers === 1 ? "" : "s"}
                </li>
                <li>
                  {plan.maxStudents ?? "∞"} étudiant
                  {plan.maxStudents === 1 ? "" : "s"}
                </li>
                <li>
                  {plan.maxExamsPerMonth ?? "∞"} examen
                  {plan.maxExamsPerMonth === 1 ? "" : "s"} / mois
                </li>
                {plan.details?.highlights.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>

              {!plan.isCurrent ? (
                <Button
                  className="mt-5 w-full"
                  variant="secondary"
                  loading={changing === plan.code}
                  disabled={changing !== null}
                  onClick={() => handleChangePlan(plan.code)}
                >
                  Choisir {plan.name}
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
