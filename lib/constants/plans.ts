export const SUBSCRIPTION_PLANS = ["free", "starter", "pro", "enterprise"] as const;

export type PlanCode = (typeof SUBSCRIPTION_PLANS)[number];

export const PLAN_DETAILS: Record<
  PlanCode,
  { label: string; description: string; highlights: string[] }
> = {
  free: {
    label: "Gratuit",
    description: "Idéal pour tester Cylentic avec une petite promotion.",
    highlights: ["1 professeur", "10 étudiants", "3 examens / mois"],
  },
  starter: {
    label: "Starter",
    description: "Pour les départements qui démarrent sérieusement.",
    highlights: ["5 professeurs", "100 étudiants", "Examens illimités"],
  },
  pro: {
    label: "Pro",
    description: "Le choix recommandé pour la majorité des établissements.",
    highlights: ["20 professeurs", "500 étudiants", "Support prioritaire"],
  },
  enterprise: {
    label: "Enterprise",
    description: "Volumes importants et besoins spécifiques.",
    highlights: ["Professeurs illimités", "Étudiants illimités", "Accompagnement dédié"],
  },
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  trial: "Essai",
  active: "Actif",
  expired: "Expiré",
  cancelled: "Annulé",
};
