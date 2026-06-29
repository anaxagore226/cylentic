import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export { ADMIN_NAV, ADMIN_NAV_GROUPS } from "@/lib/admin/nav";

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
