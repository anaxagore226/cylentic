"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useFullscreen } from "@/hooks/security/use-fullscreen";

export function ExamSecurityConsent({ examId }: { examId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { enter, supported } = useFullscreen();

  async function handleContinue() {
    setError("");
    setLoading(true);

    const ok = await enter();
    if (!ok) {
      setError(
        "Votre navigateur ne supporte pas cette fonctionnalité. Contactez votre professeur.",
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/exam-session/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      router.push(`/student/exam/waiting?examId=${examId}`);
    } catch {
      setError("Impossible de rejoindre l'examen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <div className="mb-6 flex justify-center">
        <Shield className="h-12 w-12 text-accent" />
      </div>
      <h1 className="text-xl font-semibold">Consignes de sécurité</h1>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        <li className="flex gap-2">
          <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Utilisez Chrome, Edge ou Opera sur ordinateur.
        </li>
        <li>• Fermez tous les autres onglets avant de continuer.</li>
        <li>• Le plein écran est obligatoire pendant l&apos;examen.</li>
        <li>• Toute sortie du plein écran sera enregistrée comme incident.</li>
        <li>
          • À la 1<sup>re</sup> sortie : avertissement et obligation de repasser en
          plein écran. À la 2<sup>e</sup> : exclusion définitive.
        </li>
      </ul>

      {!supported ? (
        <Alert variant="error" className="mt-6">
          Votre navigateur ne supporte pas le plein écran. Contactez votre
          professeur.
        </Alert>
      ) : null}

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      <Button className="mt-6 w-full" onClick={handleContinue} loading={loading}>
        Activer le plein écran et continuer
      </Button>
    </Card>
  );
}
