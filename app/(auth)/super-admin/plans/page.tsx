import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  requireSuperAdmin,
  SUPER_ADMIN_NAV_GROUPS,
} from "@/lib/super-admin/context";
import { PlanEditor } from "@/components/super-admin/plan-editor";

export default async function SuperAdminPlansPage() {
  const ctx = await requireSuperAdmin();
  if (!ctx) redirect("/login");

  return (
    <DashboardShell
      nav={SUPER_ADMIN_NAV_GROUPS}
      title="Plans tarifaires"
      userName={`${ctx.admin.firstName} ${ctx.admin.lastName}`}
      roleLabel="Super Administrateur — Cylentic"
    >
      <p className="mb-6 text-sm text-muted">
        Catalogue Freemium de la plateforme.
      </p>
      <PlanEditor />
    </DashboardShell>
  );
}
