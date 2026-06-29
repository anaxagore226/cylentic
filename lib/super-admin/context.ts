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

export { SUPER_ADMIN_NAV, SUPER_ADMIN_NAV_GROUPS } from "@/lib/super-admin/nav";
