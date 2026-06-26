"use client";

import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    text: "Depuis Cylentic, je peux enfin organiser des partiels de Python sur machine sans craindre ChatGPT. Le journal d'incidents m'aide à traiter les cas litigieux.",
    name: "Marie Dupont",
    role: "Professeure d'informatique",
    establishment: "IUT de Lyon",
    initials: "MD",
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    text: "La mise en place pour notre promo de 120 étudiants a pris une demi-journée. Import CSV, codes d'examen, correction automatique : tout est centralisé.",
    name: "Thomas Bernard",
    role: "Administrateur établissement",
    establishment: "Lycée technique Marseille",
    initials: "TB",
    color: "bg-sky-500/15 text-sky-400",
  },
  {
    text: "Les étudiants apprécient l'IDE intégré. Ils exécutent leurs tests avant de soumettre, et je récupère les scores dès la fin de l'épreuve.",
    name: "Sophie Martin",
    role: "Enseignante Python",
    establishment: "BTS SIO — Toulouse",
    initials: "SM",
    color: "bg-violet-500/15 text-violet-400",
  },
  {
    text: "Le mode plein écran et la détection d'onglets nous ont permis de réduire nettement les tentatives de triche lors du dernier examen blanc.",
    name: "Karim El Amrani",
    role: "Responsable pédagogique",
    establishment: "École d'ingénieurs Paris",
    initials: "KA",
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    text: "L'export Excel des résultats nous fait gagner un temps précieux en conseil de classe. Les profs peuvent aussi ajuster une note manuellement.",
    name: "Claire Rousseau",
    role: "Directrice des études",
    establishment: "Campus numérique Nantes",
    initials: "CR",
    color: "bg-rose-500/15 text-rose-400",
  },
  {
    text: "Zéro installation côté étudiants : ils se connectent avec leur identifiant et le code d'examen. C'est exactement ce qu'il nous fallait en salle.",
    name: "Julien Petit",
    role: "Professeur développement web",
    establishment: "Université de Bordeaux",
    initials: "JP",
    color: "bg-teal-500/15 text-teal-400",
  },
];

export function LandingTestimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const slides = [...testimonials, ...testimonials];

  return (
    <section className="relative overflow-hidden border-t border-card-border py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12), transparent 60%)",
          }}
        />
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="hero-fade-in hero-delay-1 relative mb-12 text-center md:mb-16">
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            Ce qu&apos;en disent les établissements
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-lg"
            style={{ color: "var(--muted)" }}
          >
            Professeurs et administrateurs utilisent Cylentic pour fiabiliser
            leurs examens de programmation et simplifier la correction.
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {slides.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="min-w-0 shrink-0 grow-0 basis-full px-3 sm:basis-1/2 lg:basis-1/3"
              >
                <article
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border border-card-border bg-card/80 p-6 shadow-lg",
                    "backdrop-blur-sm transition-transform hover:-translate-y-1",
                    "[box-shadow:0_-20px_80px_-20px_rgba(16,185,129,0.1)_inset]",
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-5 -left-5 h-32 w-32 rounded-full bg-accent/10 blur-md"
                  />

                  <Quote className="mb-4 h-8 w-8 text-accent/80" />

                  <p
                    className="relative mb-6 flex-1 text-base leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {testimonial.text}
                  </p>

                  <div className="mt-auto flex items-center gap-3 border-t border-card-border pt-4">
                    <Avatar className="h-11 w-11 border border-card-border ring-2 ring-accent/10">
                      <AvatarFallback className={testimonial.color}>
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4
                        className="truncate font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {testimonial.name}
                      </h4>
                      <p className="truncate text-sm text-accent">
                        {testimonial.role}
                      </p>
                      <p
                        className="truncate text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {testimonial.establishment}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
