import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SubmittedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
        <h1 className="mt-6 text-xl font-semibold">Examen soumis avec succès</h1>
        <p className="mt-3 text-sm text-muted">
          Votre copie a bien été enregistrée. Les résultats vous seront
          communiqués par votre professeur.
        </p>
      </Card>
    </main>
  );
}
