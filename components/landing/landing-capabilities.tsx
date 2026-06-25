import {
  Code2,
  Terminal,
  SlidersHorizontal,
  Rocket,
  FileBarChart,
  Building2,
} from "lucide-react";

const capabilities = [
  {
    icon: Code2,
    title: "IDE intégré",
    description:
      "Monaco Editor dans le navigateur : coloration syntaxique, exécution de tests et autosauvegarde continue pendant l'examen.",
  },
  {
    icon: Terminal,
    title: "Sandbox sécurisé",
    description:
      "Exécution Python isolée dans Docker, sans accès au système hôte ni aux ressources externes.",
  },
  {
    icon: SlidersHorizontal,
    title: "Examens sur mesure",
    description:
      "Durée, date de début, délai d'accès, exercices code, QCM et tests unitaires entièrement configurables.",
  },
  {
    icon: Rocket,
    title: "Zéro installation",
    description:
      "Étudiants et professeurs accèdent à la plateforme depuis n'importe quel navigateur moderne, sans logiciel à installer.",
  },
  {
    icon: FileBarChart,
    title: "Résultats & exports",
    description:
      "Scores automatiques, journal d'incidents, correction manuelle et export PDF ou Excel des résultats.",
  },
  {
    icon: Building2,
    title: "Multi-établissement",
    description:
      "Espaces dédiés par école, gestion des classes, import CSV et tableaux de bord par rôle (admin, prof, étudiant).",
  },
];

export function LandingCapabilities() {
  return (
    <section className="relative border-t border-card-border py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="relative z-10 hero-fade-in hero-delay-1">
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: "var(--foreground)" }}
            >
              Tout pour organiser vos examens de code
            </h2>
            <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
              De la préparation à la correction, Cylentic centralise chaque
              étape du cycle d&apos;évaluation en programmation.
            </p>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                "linear-gradient(152.92deg, rgba(16, 185, 129, 0.22) 4.54%, rgba(52, 211, 153, 0.18) 34.2%, rgba(16, 185, 129, 0.08) 77.55%)",
            }}
          />
        </div>

        <hr className="mx-auto mt-8 h-px w-1/2 border-0 bg-card-border" />

        <ul className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            const delayClass = `hero-delay-${Math.min(index + 2, 6)}`;

            return (
              <li
                key={item.title}
                className={`hero-fade-in ${delayClass} space-y-4 rounded-xl border border-card-border bg-card/40 p-5 transition-transform hover:-translate-y-1 [box-shadow:0_-20px_80px_-20px_rgba(16,185,129,0.12)_inset]`}
              >
                <div className="w-fit rounded-full border border-accent/20 p-4 text-accent [box-shadow:0_-20px_80px_-20px_rgba(16,185,129,0.18)_inset]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
