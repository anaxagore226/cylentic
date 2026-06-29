import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassForm } from "@/components/admin/class-form";
import { classService } from "@/lib/services/class.service";
import { ADMIN_NAV_GROUPS, requireAdmin } from "@/lib/admin/context";

export default async function AdminClassesPage() {
  const { user } = await requireAdmin();
  const classes = await classService.list(user.establishmentId);

  return (
    <DashboardShell
      nav={ADMIN_NAV_GROUPS}
      title="Classes et promotions"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      <Card className="mb-6">
        <h2 className="mb-4 font-semibold">Nouvelle classe</h2>
        <ClassForm />
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Référentiel ({classes.length})</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-muted">
            Créez votre première classe avant d&apos;enregistrer des étudiants.
          </p>
        ) : (
          <ul className="divide-y divide-card-border">
            {classes.map((cls) => (
              <li
                key={cls.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-xs text-muted">
                    {[cls.track, cls.level].filter(Boolean).join(" · ") ||
                      "—"}
                    {" · "}
                    {cls._count.studentProfiles} étudiant(s)
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
