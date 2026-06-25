import { z } from "zod";

export const unitTestSchema = z.object({
  input: z.string().optional(),
  expectedOutput: z.string().min(1),
  weight: z.coerce.number().positive().default(1),
  isHidden: z.boolean().default(false),
});

export const createCodeExerciseSchema = z.object({
  type: z.literal("code").default("code"),
  title: z.string().min(1),
  statement: z.string().min(1),
  language: z.enum(["python"]).default("python"),
  points: z.coerce.number().min(0).default(10),
  correctionMode: z.enum(["auto", "manual"]).default("auto"),
  unitTests: z.array(unitTestSchema).optional(),
});

export const qcmChoiceSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const qcmQuestionSchema = z
  .object({
    text: z.string().min(1),
    answerType: z.enum(["single", "multiple"]).default("single"),
    points: z.coerce.number().min(0).default(1),
    explanation: z.string().optional(),
    choices: z.array(qcmChoiceSchema).min(2).max(8),
  })
  .superRefine((q, ctx) => {
    const correctCount = q.choices.filter((c) => c.isCorrect).length;
    if (correctCount === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Chaque question doit avoir au moins une bonne réponse",
        path: ["choices"],
      });
    }
    if (q.answerType === "single" && correctCount !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "En réponse unique, une seule proposition doit être correcte",
        path: ["choices"],
      });
    }
  });

export const createQcmExerciseSchema = z.object({
  type: z.literal("qcm"),
  title: z.string().min(1),
  statement: z.string().optional(),
  points: z.coerce.number().min(0).default(10),
  questions: z.array(qcmQuestionSchema).min(1),
});

export const createExerciseSchema = z.discriminatedUnion("type", [
  createCodeExerciseSchema,
  createQcmExerciseSchema,
]);

export type CreateCodeExerciseInput = z.infer<typeof createCodeExerciseSchema>;
export type CreateQcmExerciseInput = z.infer<typeof createQcmExerciseSchema>;
