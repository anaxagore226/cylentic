import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  track: z.string().optional(),
  level: z.string().optional(),
});

export const createAcademicYearSchema = z.object({
  label: z.string().min(4, "Ex. 2025-2026"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  matricule: z.string().min(1),
  classId: z.string().uuid(),
  academicYearId: z.string().uuid().optional(),
});

export const createTeacherSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  subjects: z.string().optional(),
  function: z.string().optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
