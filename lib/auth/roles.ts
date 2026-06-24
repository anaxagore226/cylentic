export type UserRole = "admin" | "teacher" | "student" | "super_admin";

export function inferRoleFromIdentifier(identifier: string): UserRole | null {
  const id = identifier.trim().toUpperCase();
  if (id.startsWith("SADM-")) return "super_admin";
  if (id.startsWith("ETU-")) return "student";
  if (id.startsWith("PROF-")) return "teacher";
  if (id.startsWith("ADM-")) return "admin";
  return null;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/super-admin/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/student/change-password";
  }
}
