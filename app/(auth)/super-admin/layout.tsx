import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/super-admin/context";

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await requireSuperAdmin())) redirect("/login");
  return children;
}
