import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/super-admin/context";
import { superAdminService } from "@/lib/services/super-admin.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SuperAdminDashboardPage() {
  const ctx = await requireSuperAdmin();
  if (!ctx) redirect("/login");

  const stats = await superAdminService.getGlobalStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Tableau de bord global</h1>
      <p className="mt-1 text-sm text-muted">
        Bienvenue, {ctx.admin.firstName} {ctx.admin.lastName}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Établissements", value: stats.establishmentCount },
          { label: "Actifs", value: stats.activeEstablishments },
          { label: "Utilisateurs", value: stats.userCount },
          { label: "Examens", value: stats.examCount },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Répartition des plans</h2>
          <ul className="mt-4 space-y-2">
            {stats.planUsage.map((p) => (
              <li key={p.plan} className="flex justify-between text-sm">
                <span>{p.plan}</span>
                <Badge>{p.count}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold">Établissements récents</h2>
          <ul className="mt-4 divide-y divide-card-border">
            {stats.recentEstablishments.map((e) => (
              <li key={e.id} className="py-3 first:pt-0">
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted">
                  {e.acronym} · {e._count.users} users · Plan{" "}
                  {e.subscriptions[0]?.plan.name ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
