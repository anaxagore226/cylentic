import { z } from "zod";

export const unitTestSchema = z.object({
  input: z.string().optional(),
  expectedOutput: z.string().min(1),
  weight: z.coerce.number().positive().default(1),
  isHidden: z.boolean().default(false),
});

export const createCodeExerciseSchema = z.object({
  title: z.string().min(1),
  statement: z.string().min(1),
  language: z.enum(["python"]).default("python"),
  points: z.coerce.number().min(0).default(10),
  correctionMode: z.enum(["auto", "manual"]).default("auto"),
  unitTests: z.array(unitTestSchema).optional(),
});

export type CreateCodeExerciseInput = z.infer<typeof createCodeExerciseSchema>;
