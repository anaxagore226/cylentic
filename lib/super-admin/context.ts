import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return null;
  }

  const admin = await prisma.platformAdmin.findUnique({
    where: { id: session.sub },
  });

  if (!admin || !admin.isActive) return null;
  return { session, admin };
}

export const SUPER_ADMIN_NAV = [
  { href: "/super-admin/dashboard", label: "Tableau de bord" },
  { href: "/super-admin/establishments", label: "Établissements" },
  { href: "/super-admin/plans", label: "Plans tarifaires" },
  { href: "/super-admin/feedbacks", label: "Feedbacks" },
];
