import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/super-admin/context";
import { Card } from "@/components/ui/card";

export default async function SuperAdminFeedbacksPage() {
  if (!(await requireSuperAdmin())) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Feedbacks</h1>
      <Card className="mt-6">
        <p className="text-sm text-muted">
          Module de collecte des retours utilisateurs — à connecter à une
          table dédiée en phase ultérieure.
        </p>
      </Card>
    </div>
  );
}
