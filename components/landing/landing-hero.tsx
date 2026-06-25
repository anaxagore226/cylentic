"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "100%", label: "dans le navigateur" },
  { value: "0", label: "installation requise" },
  { value: "24/7", label: "correction automatique" },
];

const codeLines = [
  { indent: 0, parts: [{ t: "def", c: "text-violet-400" }, { t: " fibonacci", c: "text-sky-300" }, { t: "(n):", c: "text-foreground" }] },
  { indent: 1, parts: [{ t: '    if n <= 1:', c: "text-foreground" }] },
  { indent: 2, parts: [{ t: "        return n", c: "text-foreground" }] },
  { indent: 1, parts: [{ t: "    return ", c: "text-foreground" }, { t: "fibonacci", c: "text-sky-300" }, { t: "(n-1) + fibonacci(n-2)", c: "text-foreground" }] },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hero-grid-bg opacity-40"
      />
      <div
        aria-hidden
        className="hero-orb hero-orb-1 absolute -left-32 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="hero-orb hero-orb-2 absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="hero-orb hero-orb-3 absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <div className="hero-fade-in hero-delay-1 mx-auto inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent lg:mx-0">
              <Sparkles className="h-4 w-4" />
              Plateforme d&apos;examens sécurisés
            </div>

            <h1 className="hero-fade-in hero-delay-2 mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Évaluez le code
              <span className="hero-gradient-text mt-2 block">
                en toute confiance
              </span>
            </h1>

            <p className="hero-fade-in hero-delay-3 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
              Cylentic permet aux étudiants de composer des examens de
              programmation directement dans le navigateur — avec IDE intégré,
              anti-triche actif et correction automatique par tests unitaires.
            </p>

            <div className="hero-fade-in hero-delay-4 mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link href="/register/establishment">
                <Button size="lg" className="group gap-2">
                  Créer un espace établissement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Se connecter
                </Button>
              </Link>
            </div>

            <ul className="hero-fade-in hero-delay-5 mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted lg:justify-start">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                Plein écran &amp; détection d&apos;onglets
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                Sandbox Docker isolé
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                QCM &amp; exercices code
              </li>
            </ul>

            <dl className="hero-fade-in hero-delay-6 mt-12 grid grid-cols-3 gap-4 border-t border-card-border pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold text-foreground sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs text-muted sm:text-sm">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero-fade-in hero-delay-3 relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="hero-float relative rounded-2xl border border-card-border bg-card/80 p-1 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-card-border px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-accent/80" />
                <span className="ml-2 font-mono text-xs text-muted">
                  exam-session — Python
                </span>
                <span className="ml-auto flex items-center gap-1.5 rounded-md bg-accent/15 px-2 py-0.5 font-mono text-xs text-accent">
                  <Timer className="h-3 w-3" />
                  <span className="hero-timer-pulse">01:42:18</span>
                </span>
              </div>

              <div className="p-4 font-mono text-[13px] leading-6">
                {codeLines.map((line, i) => (
                  <div
                    key={i}
                    className="hero-code-line"
                    style={{ animationDelay: `${0.8 + i * 0.12}s` }}
                  >
                    <span className="mr-4 inline-block w-4 select-none text-right text-muted/40">
                      {i + 1}
                    </span>
                    <span style={{ paddingLeft: `${line.indent * 1.25}rem` }}>
                      {line.parts.map((p, j) => (
                        <span key={j} className={p.c}>
                          {p.t}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2 border-t border-card-border pt-3 text-xs text-muted">
                  <span className="rounded bg-surface-subtle px-2 py-1">
                    ▶ Exécuter
                  </span>
                  <span className="text-accent">✓ 4/4 tests réussis</span>
                </div>
              </div>
            </div>

            <div className="hero-float-delayed absolute -left-4 top-8 hidden rounded-xl border border-card-border bg-card px-4 py-3 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium">Anti-triche actif</p>
                  <p className="text-xs text-muted">Plein écran verrouillé</p>
                </div>
              </div>
            </div>

            <div className="hero-float-delayed-reverse absolute -right-2 bottom-6 hidden rounded-xl border border-card-border bg-card px-4 py-3 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15">
                  <Code2 className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">Score calculé</p>
                  <p className="text-xs text-accent">18 / 20 points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
