import { z } from "zod";
import { inferRoleFromIdentifier } from "@/lib/auth/roles";

export const loginSchema = z
  .object({
    identifier: z.string().min(3, "Identifiant requis"),
    password: z.string().min(1, "Mot de passe requis"),
    examCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const role = inferRoleFromIdentifier(data.identifier);
    if (!role) {
      ctx.addIssue({
        code: "custom",
        message: "Format d'identifiant invalide (ETU-, PROF-, ADM-, SADM-)",
        path: ["identifier"],
      });
    }
    if (role === "student" && !data.examCode?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Code d'examen requis pour les étudiants",
        path: ["examCode"],
      });
    }
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, "Minimum 6 caractères"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
