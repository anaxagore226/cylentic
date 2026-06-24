import Link from "next/link";
import Image from "next/image";
import { Shield, Code2, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

const features = [
  {
    icon: Shield,
    title: "Anti-triche intégré",
    description:
      "Plein écran, détection d'onglets, blocage du presse-papier externe et journal d'incidents.",
  },
  {
    icon: Code2,
    title: "IDE dans le navigateur",
    description:
      "Monaco Editor avec exécution Python isolée dans un sandbox Docker sécurisé.",
  },
  {
    icon: GraduationCap,
    title: "Correction automatique",
    description:
      "Tests unitaires définis par le professeur, scores calculés instantanément.",
  },
  {
    icon: Users,
    title: "Multi-établissement",
    description:
      "Gestion des classes, import CSV, plans tarifaires et tableau de bord admin.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-card-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register/establishment">
              <Button size="sm">Créer un établissement</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto mb-8 flex justify-center">
            <Image
              src="/assets/logo_cylentic.png"
              alt="Cylentic"
              width={80}
              height={80}
              className="rounded-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Examens de programmation
            <span className="mt-2 block text-accent">sécurisés en navigateur</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Cylentic permet aux étudiants de coder un examen directement dans le
            navigateur, sans aide extérieure, avec correction automatique par
            tests unitaires.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register/establishment">
              <Button size="lg">Créer un espace pour mon établissement</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Se connecter
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-card-border bg-card/30 py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="bg-card/80">
                <f.icon className="mb-4 h-8 w-8 text-accent" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-card-border py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Cylentic — Plateforme d&apos;examens sécurisés
      </footer>
    </div>
  );
}
