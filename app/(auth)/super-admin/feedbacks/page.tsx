import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import {
  requireSuperAdmin,
  SUPER_ADMIN_NAV_GROUPS,
} from "@/lib/super-admin/context";

export default async function SuperAdminFeedbacksPage() {
  const ctx = await requireSuperAdmin();
  if (!ctx) redirect("/login");

  return (
    <DashboardShell
      nav={SUPER_ADMIN_NAV_GROUPS}
      title="Feedbacks"
      userName={`${ctx.admin.firstName} ${ctx.admin.lastName}`}
      roleLabel="Super Administrateur — Cylentic"
    >
      <Card>
        <p className="text-sm text-muted">
          Module de collecte des retours utilisateurs — à connecter à une table
          dédiée en phase ultérieure.
        </p>
      </Card>
    </DashboardShell>
  );
}
