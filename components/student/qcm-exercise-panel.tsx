"use client";

interface QcmChoice {
  id: string;
  text: string;
}

interface QcmQuestion {
  id: string;
  text: string;
  answerType: "single" | "multiple";
  points: number;
  choices: QcmChoice[];
}

export function QcmExercisePanel({
  questions,
  answers,
  onChange,
}: {
  questions: QcmQuestion[];
  answers: Record<string, string[]>;
  onChange: (questionId: string, choiceIds: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-card-border p-4">
          <p className="font-medium">
            {i + 1}. {q.text}
            <span className="ml-2 text-xs text-muted">({q.points} pt)</span>
          </p>
          <div className="mt-3 space-y-2">
            {q.choices.map((c) => {
              const selected = answers[q.id]?.includes(c.id) ?? false;
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-card-border hover:border-accent/30"
                  }`}
                >
                  <input
                    type={q.answerType === "single" ? "radio" : "checkbox"}
                    name={`qcm-${q.id}`}
                    checked={selected}
                    onChange={() => {
                      if (q.answerType === "single") {
                        onChange(q.id, [c.id]);
                      } else {
                        const current = answers[q.id] ?? [];
                        const next = selected
                          ? current.filter((id) => id !== c.id)
                          : [...current, c.id];
                        onChange(q.id, next);
                      }
                    }}
                  />
                  <span className="text-sm">{c.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
