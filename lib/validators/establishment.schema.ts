import { z } from "zod";

export const establishmentTypes = [
  { value: "university_public", label: "Université publique" },
  { value: "university_private", label: "Université privée" },
  { value: "engineering_school", label: "École d'ingénieurs" },
  { value: "bts", label: "BTS" },
  { value: "technical_highschool", label: "Lycée technique" },
  { value: "other", label: "Autre" },
] as const;

export const subscriptionPlans = [
  { value: "free", label: "Gratuit" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export const createEstablishmentSchema = z.object({
  establishment: z.object({
    name: z.string().min(2, "Nom requis"),
    acronym: z
      .string()
      .min(2, "Sigle requis")
      .max(10)
      .regex(/^[A-Z0-9]+$/, "Sigle en majuscules sans espaces"),
    type: z.enum([
      "university_public",
      "university_private",
      "engineering_school",
      "bts",
      "technical_highschool",
      "other",
    ]),
    country: z.string().min(2),
    city: z.string().min(2),
    timezone: z.string().min(2),
    officialEmail: z.string().email("Email invalide"),
    phone: z.string().min(6),
  }),
  admin: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    function: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6, "Minimum 6 caractères"),
  }),
  planCode: z.enum(["free", "starter", "pro", "enterprise"]).default("pro"),
});

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
