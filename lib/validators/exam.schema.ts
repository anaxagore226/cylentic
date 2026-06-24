import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(3, "Nom requis"),
  startAt: z.string().datetime({ message: "Date de début invalide" }),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  accessDelayMinutes: z.coerce.number().int().min(0).max(120).default(15),
  correctionMode: z.enum(["auto", "manual"]).default("auto"),
  classIds: z.array(z.string().uuid()).min(1, "Sélectionnez au moins une classe"),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
