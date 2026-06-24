"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Logo } from "@/components/shared/logo";
import { inferRoleFromIdentifier } from "@/lib/auth/roles";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [examCode, setExamCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const role = identifier ? inferRoleFromIdentifier(identifier) : null;
  const isStudent = role === "student";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          ...(isStudent ? { examCode } : {}),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Erreur de connexion");
        return;
      }

      router.push(json.data.redirectTo);
      router.refresh();
    } catch {
      setError("Impossible de se connecter. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <h1 className="text-xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-muted">
        Votre rôle est déduit automatiquement de votre identifiant.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Identifiant"
          placeholder="ETU-UANO-2025-0042"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
        />
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {isStudent ? (
          <Input
            label="Code d'examen"
            placeholder="K7BX-29QR"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            required
          />
        ) : null}

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore d&apos;espace ?{" "}
        <Link href="/register/establishment" className="text-accent hover:underline">
          Créer un établissement
        </Link>
      </p>
    </Card>
  );
}
