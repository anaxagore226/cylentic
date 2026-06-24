import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AcademicYearForm } from "@/components/admin/academic-year-form";
import { academicYearService } from "@/lib/services/class.service";
import { ADMIN_NAV, requireAdmin } from "@/lib/admin/context";

export default async function AdminAcademicYearsPage() {
  const { user } = await requireAdmin();
  const years = await academicYearService.list(user.establishmentId);

  return (
    <DashboardShell
      nav={ADMIN_NAV}
      title="Années académiques"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      <Card className="mb-6">
        <h2 className="mb-4 font-semibold">Nouvelle année</h2>
        <AcademicYearForm />
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Historique</h2>
        <ul className="divide-y divide-card-border">
          {years.length === 0 ? (
            <li className="py-4 text-sm text-muted">Aucune année créée.</li>
          ) : (
            years.map((year) => (
              <li
                key={year.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="font-medium">{year.label}</span>
                <div className="flex gap-2">
                  {year.isActive ? (
                    <Badge variant="success">Courante</Badge>
                  ) : null}
                  {year.isArchived ? (
                    <Badge variant="default">Archivée</Badge>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>
    </DashboardShell>
  );
}
