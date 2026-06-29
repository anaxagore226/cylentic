"use client";

import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Sparkles, ArrowRight, Check, Star, Zap, Shield, Building2 } from "lucide-react";
import { PLAN_DETAILS } from "@/lib/constants/plans";

type BillingFrequency = "monthly" | "yearly";

type PlanConfig = {
  id: string;
  name: string;
  icon: typeof Star;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  price: {
    monthly: number | "free" | "custom";
    yearly: number | "free" | "custom";
  };
};

function mergeFeatures(...groups: string[][]): string[] {
  return [...new Set(groups.flat())];
}

const plans: PlanConfig[] = [
  {
    id: "free",
    name: PLAN_DETAILS.free.label,
    icon: Star,
    description: PLAN_DETAILS.free.description,
    features: mergeFeatures(PLAN_DETAILS.free.highlights, [
      "IDE & anti-triche inclus",
      "Correction automatique",
    ]),
    cta: "Commencer gratuitement",
    href: "/register/establishment",
    price: { monthly: "free", yearly: "free" },
  },
  {
    id: "starter",
    name: PLAN_DETAILS.starter.label,
    icon: Zap,
    description: PLAN_DETAILS.starter.description,
    features: mergeFeatures(PLAN_DETAILS.starter.highlights, [
      "Export PDF & Excel",
      "Journal d'incidents",
    ]),
    cta: "Choisir Starter",
    href: "/register/establishment",
    price: { monthly: 19000, yearly: 15200 },
  },
  {
    id: "pro",
    name: PLAN_DETAILS.pro.label,
    icon: Shield,
    description: PLAN_DETAILS.pro.description,
    features: mergeFeatures(PLAN_DETAILS.pro.highlights, [
      "Surveillance en direct",
    ]),
    cta: "Choisir Pro",
    href: "/register/establishment",
    popular: true,
    price: { monthly: 65000, yearly: 52000 },
  },
  {
    id: "enterprise",
    name: PLAN_DETAILS.enterprise.label,
    icon: Building2,
    description: PLAN_DETAILS.enterprise.description,
    features: mergeFeatures(PLAN_DETAILS.enterprise.highlights, [
      "SLA & formation sur site",
      "Hébergement dédié possible",
    ]),
    cta: "Nous contacter",
    href: "/register/establishment",
    price: { monthly: "custom", yearly: "custom" },
  },
];

function formatPrice(
  value: number | "free" | "custom",
  frequency: BillingFrequency,
) {
  if (value === "free") return "Gratuit";
  if (value === "custom") return "Sur devis";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function LandingPricing() {
  const [frequency, setFrequency] = useState<BillingFrequency>("monthly");

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-card-border py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[40%] w-[60%] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-[10%] bottom-0 h-[40%] w-[40%] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="hero-fade-in hero-delay-1 mx-auto mb-10 max-w-2xl">
          <Badge className="mb-4 border-accent/20 bg-accent/10 px-4 py-1 text-sm text-accent">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Tarifs
          </Badge>
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            Le plan adapté à votre établissement
          </h2>
          <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
            Tarification transparente, sans frais cachés. Évoluez selon la taille
            de votre promotion et vos besoins.
          </p>
        </div>

        <div className="hero-fade-in hero-delay-2 mb-12 flex justify-center">
          <Tabs
            value={frequency}
            onValueChange={(v) => setFrequency(v as BillingFrequency)}
            className="inline-block rounded-full border border-card-border bg-card/50 p-1 shadow-sm"
          >
            <TabsList className="bg-transparent">
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
              <TabsTrigger value="yearly" className="gap-2">
                Annuel
                <Badge variant="success" className="ml-1 text-[10px]">
                  -20 %
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const priceValue = plan.price[frequency];
            const isNumeric = typeof priceValue === "number";

            return (
              <div
                key={plan.id}
                className={cn(
                  "hero-fade-in flex",
                  `hero-delay-${Math.min(index + 2, 6)}`,
                )}
              >
                <Card
                  className={cn(
                    "relative flex h-full w-full flex-col text-left transition-transform hover:-translate-y-1",
                    plan.popular && "border-accent/40 ring-2 ring-accent/30",
                  )}
                >
                  {plan.popular ? (
                    <div className="absolute -top-3 right-0 left-0 mx-auto w-fit">
                      <Badge variant="success" className="px-4 py-1 shadow-sm">
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        Recommandé
                      </Badge>
                    </div>
                  ) : null}

                  <CardHeader className={cn(plan.popular && "pt-8")}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          plan.popular
                            ? "bg-accent/15 text-accent"
                            : "bg-surface-subtle text-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className={plan.popular ? "text-accent" : undefined}>
                        {plan.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-3 space-y-3">
                      <p>{plan.description}</p>
                      <div>
                        <span
                          className={cn(
                            "text-2xl font-bold sm:text-3xl",
                            plan.popular ? "text-accent" : "",
                          )}
                          style={
                            plan.popular
                              ? undefined
                              : { color: "var(--foreground)" }
                          }
                        >
                          {formatPrice(priceValue, frequency)}
                        </span>
                        {isNumeric ? (
                          <span
                            className="ml-1 text-sm"
                            style={{ color: "var(--muted)" }}
                          >
                            /mois, facturé {frequency === "monthly" ? "mensuellement" : "annuellement"}
                          </span>
                        ) : null}
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={`${plan.id}-${featureIndex}`}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            plan.popular
                              ? "bg-accent/15 text-accent"
                              : "bg-surface-subtle text-muted",
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span style={{ color: "var(--foreground)" }}>{feature}</span>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter>
                    <Link href={plan.href} className="w-full">
                      <Button
                        variant={plan.popular ? "primary" : "secondary"}
                        className="group w-full"
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
