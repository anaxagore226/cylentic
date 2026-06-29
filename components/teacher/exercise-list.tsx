import Link from "next/link";
import { Code2, ListChecks, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteExerciseButton } from "@/components/teacher/delete-exercise-button";
import { cn } from "@/lib/utils/cn";

interface ExerciseItem {
  id: string;
  title: string;
  type: string;
  points: unknown;
}

export function ExerciseList({
  examId,
  exercises,
  emptyHint,
  editable = false,
}: {
  examId: string;
  exercises: ExerciseItem[];
  emptyHint?: string;
  editable?: boolean;
}) {
  if (exercises.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-card-border bg-card/30 px-6 py-10 text-center">
        <p className="text-sm text-muted">
          {emptyHint ?? "Aucun exercice pour l'instant."}
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {exercises.map((ex, index) => {
        const isCode = ex.type === "code";
        const Icon = isCode ? Code2 : ListChecks;

        return (
          <li
            key={ex.id}
            className="flex items-center gap-4 rounded-xl border border-card-border bg-card/60 px-4 py-3 transition-colors hover:border-accent/20"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-muted">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted">
                  Exercice {index + 1}
                </span>
                <Badge
                  variant={isCode ? "success" : "default"}
                  className={cn(!isCode && "border-sky-500/30 bg-sky-500/10 text-sky-400")}
                >
                  {isCode ? "Code Python" : "QCM"}
                </Badge>
              </div>
              <p className="truncate font-medium">{ex.title}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-accent">
              {String(ex.points)} pts
            </span>
            {editable ? (
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/teacher/exams/${examId}/exercises/${ex.id}/edit`}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                  aria-label={`Modifier ${ex.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteExerciseButton
                  examId={examId}
                  exerciseId={ex.id}
                  exerciseTitle={ex.title}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
