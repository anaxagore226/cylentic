import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/academic-years", label: "Années académiques" },
  { href: "/admin/students", label: "Étudiants" },
  { href: "/admin/teachers", label: "Professeurs" },
  { href: "/admin/admins", label: "Administrateurs" },
  { href: "/admin/activity-logs", label: "Journal d'activité" },
  { href: "/admin/subscription", label: "Abonnement" },
];

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { establishment: true },
  });

  if (!user) redirect("/login");

  return { session, user };
}
