import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/super-admin/context";
import { PlanEditor } from "@/components/super-admin/plan-editor";

export default async function SuperAdminPlansPage() {
  if (!(await requireSuperAdmin())) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Plans tarifaires</h1>
      <p className="mt-1 text-sm text-muted">Catalogue Freemium de la plateforme.</p>
      <div className="mt-6">
        <PlanEditor />
      </div>
    </div>
  );
}
