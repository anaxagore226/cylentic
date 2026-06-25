import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingCapabilities } from "@/components/landing/landing-capabilities";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-card-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <nav className="flex items-center gap-3">
            <ThemeToggle />
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
        <LandingHero />
        <LandingFeatures />
        <LandingCapabilities />
      </main>

      <footer className="border-t border-card-border py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Cylentic — Plateforme d&apos;examens sécurisés
      </footer>
    </div>
  );
}
