import Link from "next/link";
import { Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const socialLinks = [
  { icon: Globe, label: "Site web", href: "/" },
  { icon: Mail, label: "Email", href: "mailto:contact@cylentic.fr" },
  { icon: Share2, label: "Partager", href: "/#contact" },
];

const platformLinks = [
  { text: "Fonctionnalités", href: "/#features" },
  { text: "Notre équipe", href: "/#team" },
  { text: "Tarifs", href: "/#pricing" },
  { text: "Créer un établissement", href: "/register/establishment" },
];

const productLinks = [
  { text: "Anti-triche intégré", href: "/#features" },
  { text: "IDE dans le navigateur", href: "/#capabilities" },
  { text: "Correction automatique", href: "/#capabilities" },
  { text: "Multi-établissement", href: "/#capabilities" },
];

const helpfulLinks = [
  { text: "FAQ", href: "/#faq" },
  { text: "Nous contacter", href: "/#contact" },
  { text: "Connexion", href: "/login", hasIndicator: true },
];

const contactInfo = [
  {
    icon: Mail,
    text: "contact@cylentic.fr",
    href: "mailto:contact@cylentic.fr",
  },
  {
    icon: Phone,
    text: "+33 1 84 88 00 00",
    href: "tel:+33184880000",
  },
  {
    icon: MapPin,
    text: "Paris, France",
    href: "#",
    isAddress: true,
  },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full rounded-t-2xl border-t border-card-border bg-card/40">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 sm:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div>
            <div className="flex justify-center sm:justify-start">
              <Logo size={36} />
            </div>

            <p
              className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed sm:mx-0 sm:max-w-xs sm:text-left"
              style={{ color: "var(--muted)" }}
            >
              Plateforme d&apos;examens de programmation sécurisés en
              navigateur. Nous aidons les établissements à évaluer le code en
              toute confiance.
            </p>

            <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent transition-colors hover:text-accent-hover"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:col-span-2">
            <div className="text-center sm:text-left">
              <p
                className="text-lg font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Plateforme
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {platformLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-accent"
                      style={{ color: "var(--muted)" }}
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p
                className="text-lg font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Produit
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {productLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-accent"
                      style={{ color: "var(--muted)" }}
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p
                className="text-lg font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Aide
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {helpfulLinks.map(({ text, href, hasIndicator }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className={
                        hasIndicator
                          ? "group inline-flex items-center justify-center gap-1.5 sm:justify-start"
                          : "transition-colors hover:text-accent"
                      }
                      style={{ color: "var(--muted)" }}
                    >
                      <span>{text}</span>
                      {hasIndicator ? (
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-accent" />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:col-span-2 sm:text-left md:col-span-3 lg:col-span-1">
              <p
                className="text-lg font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Contact
              </p>
              <ul className="mt-6 space-y-4 text-sm">
                {contactInfo.map(({ icon: Icon, text, href, isAddress }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="flex items-center justify-center gap-2 sm:justify-start"
                      style={{ color: "var(--muted)" }}
                    >
                      <Icon className="size-4 shrink-0 text-accent" />
                      {isAddress ? (
                        <address className="not-italic">{text}</address>
                      ) : (
                        <span>{text}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-card-border pt-6">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-sm sm:flex-row sm:text-left">
            <p style={{ color: "var(--muted)" }}>
              © {year} Cylentic — Tous droits réservés.
            </p>
            <p style={{ color: "var(--muted)" }}>
              Examens de programmation sécurisés en navigateur
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
