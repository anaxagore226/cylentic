import {
  Shield,
  Code2,
  GraduationCap,
  Users,
  Target,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Anti-triche intégré",
    description:
      "Plein écran obligatoire, détection des changements d'onglet, blocage du presse-papier externe et journal d'incidents en temps réel.",
    accent: "text-accent",
    iconBg: "bg-accent/15",
  },
  {
    icon: Code2,
    title: "IDE dans le navigateur",
    description:
      "Monaco Editor avec coloration syntaxique, exécution Python isolée dans un sandbox Docker et autosauvegarde continue.",
    accent: "text-sky-400",
    iconBg: "bg-sky-500/15",
  },
  {
    icon: GraduationCap,
    title: "Correction automatique",
    description:
      "Tests unitaires définis par le professeur, scores calculés instantanément à la soumission, avec possibilité de correction manuelle.",
    accent: "text-amber-400",
    iconBg: "bg-amber-500/15",
  },
  {
    icon: Users,
    title: "Multi-établissement",
    description:
      "Gestion des classes et promotions, import CSV, plans tarifaires flexibles et tableaux de bord dédiés par rôle.",
    accent: "text-violet-400",
    iconBg: "bg-violet-500/15",
  },
];

export function LandingFeatures() {
  return (
    <section className="relative border-t border-card-border bg-background py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="hero-fade-in hero-delay-1 mx-auto mb-16 max-w-2xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
            <Sparkles className="h-4 w-4" />
            Fonctionnalités
          </div>
          <h2
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            Une plateforme complète pour{" "}
            <span className="text-accent">vos examens</span>
          </h2>
          <p className="mt-6 text-lg" style={{ color: "var(--muted)" }}>
            De la création d&apos;examen à la correction des copies, Cylentic
            couvre tout le cycle d&apos;évaluation en programmation.
          </p>
        </div>

        <div className="hero-fade-in hero-delay-2 mb-24 grid gap-6 md:grid-cols-2">
          <Card className="transition-transform hover:-translate-y-1">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h3
              className="mb-4 text-2xl font-bold sm:text-3xl"
              style={{ color: "var(--foreground)" }}
            >
              Le problème que nous résolvons
            </h3>
            <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              Les outils d&apos;IA rendent les examens de programmation sur
              ordinateur peu fiables. Les professeurs renoncent à évaluer le
              code en conditions réelles — Cylentic rétablit la confiance.
            </p>
          </Card>

          <Card className="transition-transform hover:-translate-y-1">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/15">
              <Target className="h-8 w-8 text-sky-400" />
            </div>
            <h3
              className="mb-4 text-2xl font-bold sm:text-3xl"
              style={{ color: "var(--foreground)" }}
            >
              Notre ambition
            </h3>
            <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              Permettre à chaque établissement d&apos;organiser des examens de
              code équitables, sécurisés et corrigés automatiquement — sans
              installation, directement dans le navigateur.
            </p>
          </Card>
        </div>

        <div className="hero-fade-in hero-delay-3 mb-12 text-center">
          <h3
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--foreground)" }}
          >
            Tout l&apos;écosystème en un seul outil
          </h3>
          <p
            className="mx-auto mt-4 max-w-2xl text-lg"
            style={{ color: "var(--muted)" }}
          >
            Chaque fonctionnalité est pensée pour les professeurs, les
            administrateurs et les étudiants.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const delayClass =
              index === 0
                ? "hero-delay-3"
                : index === 1
                  ? "hero-delay-4"
                  : index === 2
                    ? "hero-delay-5"
                    : "hero-delay-6";

            return (
              <Card
                key={feature.title}
                className={`hero-fade-in ${delayClass} transition-transform hover:-translate-y-1`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${feature.accent}`} />
                </div>
                <h4
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {feature.title}
                </h4>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
