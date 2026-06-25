"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldX } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SubmittedMessage() {
  const searchParams = useSearchParams();
  const excluded = searchParams.get("reason") === "excluded";

  if (excluded) {
    return (
      <Card className="max-w-md text-center">
        <ShieldX className="mx-auto h-16 w-16 text-danger" />
        <h1 className="mt-6 text-xl font-semibold">Examen fermé — exclusion</h1>
        <p className="mt-3 text-sm text-muted">
          Vous avez quitté le mode plein écran une seconde fois. Votre session
          a été clôturée et vous ne pouvez plus accéder à cet examen. Contactez
          votre professeur si nécessaire.
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-md text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
      <h1 className="mt-6 text-xl font-semibold">Examen soumis avec succès</h1>
      <p className="mt-3 text-sm text-muted">
        Votre copie a bien été enregistrée. Les résultats vous seront communiqués
        par votre professeur.
      </p>
    </Card>
  );
}
