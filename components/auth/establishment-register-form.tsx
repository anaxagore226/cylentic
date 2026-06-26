"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Logo } from "@/components/shared/logo";
import {
  establishmentTypes,
  subscriptionPlans,
} from "@/lib/validators/establishment.schema";
import { PLAN_DETAILS } from "@/lib/constants/plans";

const TIMEZONES = [
  { value: "Africa/Ouagadougou", label: "Africa/Ouagadougou (GMT)" },
  { value: "Africa/Abidjan", label: "Africa/Abidjan (GMT)" },
  { value: "Africa/Dakar", label: "Africa/Dakar (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
];

export function EstablishmentRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    identifier: string;
    simulatedPayment: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    acronym: "",
    type: "university_public",
    country: "Burkina Faso",
    city: "",
    timezone: "Africa/Ouagadougou",
    officialEmail: "",
    phone: "",
    firstName: "",
    lastName: "",
    function: "",
    email: "",
    password: "",
    planCode: "pro",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/establishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishment: {
            name: form.name,
            acronym: form.acronym.toUpperCase(),
            type: form.type,
            country: form.country,
            city: form.city,
            timezone: form.timezone,
            officialEmail: form.officialEmail,
            phone: form.phone,
          },
          admin: {
            firstName: form.firstName,
            lastName: form.lastName,
            function: form.function,
            email: form.email,
            password: form.password,
          },
          planCode: form.planCode,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Erreur lors de l'inscription");
        return;
      }

      setSuccess({
        identifier: json.data.admin.identifier,
        simulatedPayment: json.data.simulatedPayment,
      });
    } catch {
      setError("Impossible de créer l'établissement.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-xl font-semibold">Espace créé avec succès</h1>
        {success.simulatedPayment ? (
          <Alert variant="success" className="mt-4">
            Paiement en cours d&apos;intégration — votre compte est activé en
            mode Pro gratuitement pendant 30 jours.
          </Alert>
        ) : null}
        <p className="mt-4 text-sm text-muted">
          Votre identifiant administrateur :{" "}
          <strong className="text-foreground">{success.identifier}</strong>
        </p>
        <p className="mt-3 text-sm text-muted">
          À la connexion, un assistant vous guidera pour configurer votre année
          académique, vos classes et vos premiers utilisateurs.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
          Se connecter
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="text-xl font-semibold">Créer un espace établissement</h1>
      <p className="mt-1 text-sm text-muted">
        Inscription en deux étapes : établissement puis administrateur.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
            Établissement
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom officiel"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <Input
              label="Sigle / Abréviation"
              placeholder="UANO"
              value={form.acronym}
              onChange={(e) => update("acronym", e.target.value.toUpperCase())}
              required
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              options={establishmentTypes.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
            />
            <Input
              label="Pays"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              required
            />
            <Input
              label="Ville"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              required
            />
            <Select
              label="Fuseau horaire"
              value={form.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              options={TIMEZONES}
            />
            <Input
              label="Email officiel"
              type="email"
              value={form.officialEmail}
              onChange={(e) => update("officialEmail", e.target.value)}
              required
            />
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
            Administrateur
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Prénom"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Input
              label="Nom"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
            <Input
              label="Fonction"
              placeholder="DSI, Directeur des études…"
              value={form.function}
              onChange={(e) => update("function", e.target.value)}
              required
            />
            <Input
              label="Email professionnel"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              className="sm:col-span-2"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
            Plan tarifaire
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {subscriptionPlans.map((plan) => {
              const details = PLAN_DETAILS[plan.value];
              return (
              <label
                key={plan.value}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  form.planCode === plan.value
                    ? "border-accent bg-accent/5"
                    : "border-card-border hover:border-accent/30"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.value}
                  checked={form.planCode === plan.value}
                  onChange={() => update("planCode", plan.value)}
                  className="sr-only"
                />
                <span className="font-medium">{details.label}</span>
                <p className="mt-1 text-xs text-muted">{details.description}</p>
                <ul className="mt-2 space-y-0.5 text-xs text-muted">
                  {details.highlights.map((h) => (
                    <li key={h}>· {h}</li>
                  ))}
                </ul>
              </label>
            );
            })}
          </div>
        </section>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Créer mon établissement
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
