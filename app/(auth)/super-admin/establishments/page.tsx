import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  requireSuperAdmin,
  SUPER_ADMIN_NAV_GROUPS,
} from "@/lib/super-admin/context";
import { EstablishmentTable } from "@/components/super-admin/establishment-table";

export default async function SuperAdminEstablishmentsPage() {
  const ctx = await requireSuperAdmin();
  if (!ctx) redirect("/login");

  return (
    <DashboardShell
      nav={SUPER_ADMIN_NAV_GROUPS}
      title="Établissements"
      userName={`${ctx.admin.firstName} ${ctx.admin.lastName}`}
      roleLabel="Super Administrateur — Cylentic"
    >
      <p className="mb-6 text-sm text-muted">
        Gestion globale des établissements — métadonnées uniquement.
      </p>
      <EstablishmentTable />
    </DashboardShell>
  );
}
