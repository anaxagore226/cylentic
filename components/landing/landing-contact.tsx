"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ContactGlobe } from "@/components/landing/contact-globe";
import { SparklesCore } from "@/components/ui/sparkles";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";

export function LandingContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative w-full overflow-hidden border-t border-card-border py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(16, 185, 129, 0.5), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full opacity-10 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(52, 211, 153, 0.4), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="overflow-hidden rounded-[28px] border border-card-border bg-card/60 shadow-xl backdrop-blur-sm">
          <div className="grid md:grid-cols-2">
            <div className="relative p-6 md:p-10">
              <div className="hero-fade-in hero-delay-1 relative mb-8">
                <h2
                  className="inline text-4xl font-bold tracking-tight md:text-5xl"
                  style={{ color: "var(--foreground)" }}
                >
                  Contactez{" "}
                </h2>
                <span className="relative inline text-4xl font-bold tracking-tight text-accent italic md:text-5xl">
                  nous
                </span>
                <SparklesCore className="absolute inset-0 top-0 h-24 w-full" />
              </div>

              <form
                onSubmit={handleSubmit}
                className="hero-fade-in hero-delay-2 space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Nom</Label>
                    <Input
                      id="contact-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre besoin ou posez votre question…"
                    required
                    className="h-40 resize-none"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours…
                    </span>
                  ) : isSubmitted ? (
                    <span className="flex items-center justify-center">
                      <Check className="mr-2 h-4 w-4" />
                      Message envoyé !
                    </span>
                  ) : (
                    "Envoyer le message"
                  )}
                </Button>
              </form>
            </div>

            <div className="relative flex items-center justify-center overflow-hidden p-6 md:p-10">
              <article className="relative flex min-h-[320px] w-full max-w-[450px] flex-col justify-between overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-b from-accent to-accent/20 p-6 text-white md:min-h-[400px] md:p-8">
                <p className="relative z-10 text-2xl leading-tight font-semibold tracking-tight md:text-3xl lg:text-4xl">
                  Une question sur Cylentic ou un besoin Enterprise ?
                </p>
                <p className="relative z-10 mt-4 text-sm text-white/80 md:text-base">
                  Notre équipe vous répond sous 48 h ouvrées pour une démo,
                  un devis ou un accompagnement à la mise en place.
                </p>
                <div className="absolute -right-16 -bottom-16 z-0 transition-transform duration-700 hover:scale-105 md:-right-20 md:-bottom-20">
                  <ContactGlobe />
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
