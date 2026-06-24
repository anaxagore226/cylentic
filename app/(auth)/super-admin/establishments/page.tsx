import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/super-admin/context";
import { EstablishmentTable } from "@/components/super-admin/establishment-table";

export default async function SuperAdminEstablishmentsPage() {
  if (!(await requireSuperAdmin())) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Établissements</h1>
      <p className="mt-1 text-sm text-muted">
        Gestion globale — métadonnées uniquement.
      </p>
      <div className="mt-6">
        <EstablishmentTable />
      </div>
    </div>
  );
}
