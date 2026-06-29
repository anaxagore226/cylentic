"use client";

import { useState } from "react";
import { Code2, ListChecks, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseCodeForm } from "@/components/teacher/exercise-code-form";
import { ExerciseQcmForm } from "@/components/teacher/exercise-qcm-form";

export function ExerciseComposer({ examId }: { examId: string }) {
  const [tab, setTab] = useState("code");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-card-border bg-gradient-to-r from-accent/5 via-transparent to-sky-500/5 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Plus className="h-3.5 w-3.5" />
              Composition
            </div>
            <h2 className="text-lg font-semibold">Ajouter un exercice</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Créez un exercice de programmation ou un bloc QCM. Les exercices
              sont numérotés dans l&apos;ordre d&apos;ajout.
            </p>
          </div>
          {successMessage ? (
            <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
              {successMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start rounded-xl border border-card-border bg-card/50 p-1 sm:w-auto">
            <TabsTrigger value="code" className="flex-1 sm:flex-none">
              <Code2 className="h-4 w-4" />
              Exercice code
            </TabsTrigger>
            <TabsTrigger value="qcm" className="flex-1 sm:flex-none">
              <ListChecks className="h-4 w-4" />
              Bloc QCM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <ExerciseCodeForm
              examId={examId}
              embedded
              onSuccess={() =>
                handleSuccess("Exercice Python ajouté à l'examen.")
              }
            />
          </TabsContent>

          <TabsContent value="qcm">
            <ExerciseQcmForm
              examId={examId}
              embedded
              onSuccess={() => handleSuccess("Bloc QCM ajouté à l'examen.")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
