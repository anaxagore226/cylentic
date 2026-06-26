"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const faqs = [
  {
    id: "1",
    question: "Comment démarrer avec Cylentic ?",
    answer:
      "Créez un espace établissement, importez vos professeurs et étudiants, puis lancez votre premier examen. Le plan Gratuit permet de tester la plateforme sans carte bancaire.",
  },
  {
    id: "2",
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Les abonnements Starter et Pro peuvent être réglés par virement ou mobile money selon votre pays. Le plan Enterprise fait l'objet d'un devis personnalisé.",
  },
  {
    id: "3",
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer:
      "Oui. Vous pouvez changer ou résilier votre plan depuis l'espace administrateur. L'accès reste actif jusqu'à la fin de la période en cours.",
  },
  {
    id: "4",
    question: "Proposez-vous des solutions pour les grands établissements ?",
    answer:
      "Le plan Enterprise couvre les volumes illimités, un accompagnement dédié, des SLA et éventuellement un hébergement dédié. Contactez-nous pour un devis sur mesure.",
  },
  {
    id: "5",
    question: "Comment fonctionne l'anti-triche ?",
    answer:
      "Cylentic impose le mode plein écran, détecte les changements d'onglet, bloque le presse-papier externe et enregistre chaque incident dans un journal consultable par le professeur.",
  },
  {
    id: "6",
    question: "Un essai gratuit est-il disponible ?",
    answer:
      "Oui. Le plan Gratuit inclut 1 professeur, 10 étudiants et 3 examens par mois — suffisant pour évaluer la plateforme en conditions réelles.",
  },
  {
    id: "7",
    question: "Quels langages de programmation sont supportés ?",
    answer:
      "Le MVP prend en charge Python avec exécution dans un sandbox Docker. D'autres langages sont prévus dans les prochaines versions.",
  },
  {
    id: "8",
    question: "Comment se déroule la correction des copies ?",
    answer:
      "À la soumission, les tests unitaires définis par le professeur sont exécutés automatiquement. Le score est calculé instantanément et une correction manuelle reste possible.",
  },
  {
    id: "9",
    question: "Puis-je changer de plan en cours d'année ?",
    answer:
      "Oui. La montée ou la descente de plan se fait depuis le tableau de bord admin. Les limites (étudiants, professeurs, examens) s'ajustent immédiatement.",
  },
  {
    id: "10",
    question: "Les données de mes étudiants sont-elles sécurisées ?",
    answer:
      "Les mots de passe sont hachés, les sessions sont chiffrées et chaque établissement est isolé. Les exécutions de code se font dans un environnement sandboxé sans accès réseau externe.",
  },
];

export function LandingFaq() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <section id="faq" className="relative w-full border-t border-card-border py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="hero-fade-in hero-delay-1 mb-12 text-center">
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            Questions fréquentes
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: "var(--muted)" }}>
            Retrouvez les réponses aux questions les plus courantes sur Cylentic.
          </p>
        </div>

        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
          className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {faqs.map((faq) => {
            const isOpen = openItems.includes(faq.id);

            return (
              <div
                key={faq.id}
                className={cn(
                  "h-fit rounded-xl border p-1 transition-all duration-300",
                  isOpen
                    ? "border-accent/30 bg-accent/10 shadow-[0_0_20px_3px_rgba(16,185,129,0.12)]"
                    : "border-card-border bg-card/30 hover:border-accent/20 hover:bg-accent/5",
                )}
              >
                <AccordionItem
                  value={faq.id}
                  className={cn(
                    "rounded-lg border border-card-border bg-card px-5 py-1 shadow-none transition-all",
                    isOpen && "border-accent/20 bg-gradient-to-t from-accent/5 to-card",
                  )}
                >
                  <AccordionTrigger className="cursor-pointer py-4 hover:no-underline">
                    <span
                      className={cn(
                        "text-left text-base font-medium transition-colors sm:text-lg",
                        isOpen ? "text-accent" : "",
                      )}
                      style={isOpen ? undefined : { color: "var(--foreground)" }}
                    >
                      {faq.question}
                    </span>
                    <CircleHelp
                      className={cn(
                        "size-5 shrink-0 text-accent transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-dashed border-card-border pb-4">
                    <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </div>
            );
          })}
        </Accordion>

        <div className="hero-fade-in hero-delay-3 group relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-8 py-12 text-center shadow-[0_0_45px_10px_rgba(16,185,129,0.1)]">
          <BorderBeam duration={12} size={120} colorFrom="#10b981" colorTo="#6ee7b7" />
          <BorderBeam
            duration={12}
            size={120}
            colorFrom="#34d399"
            colorTo="#10b981"
            reverse
          />

          <div className="relative z-10">
            <h3 className="mb-3 text-2xl font-semibold text-accent md:text-3xl">
              Une question reste sans réponse ?
            </h3>
            <p className="mx-auto mb-6 max-w-xl text-base md:text-lg" style={{ color: "var(--muted)" }}>
              Notre équipe est disponible pour vous accompagner dans la mise en
              place de vos examens sécurisés.
            </p>
            <Link href="#contact">
              <Button size="lg" className="relative z-10">
                Nous contacter
              </Button>
            </Link>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 flex h-full items-end justify-end overflow-hidden"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full bg-accent/40 transition-transform duration-700 group-hover:-translate-y-8"
                style={{
                  right: `${2 + i * 2.5}rem`,
                  bottom: `${-4 - i * 2}rem`,
                  width: "0.35rem",
                  height: `${8 + i * 2}rem`,
                  transitionDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
