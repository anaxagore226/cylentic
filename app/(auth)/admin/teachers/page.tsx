import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherForm } from "@/components/admin/teacher-form";
import { userService } from "@/lib/services/user.service";
import { ADMIN_NAV_GROUPS, requireAdmin } from "@/lib/admin/context";

export default async function AdminTeachersPage() {
  const { user } = await requireAdmin();
  const teachers = await userService.listTeachers(user.establishmentId);

  return (
    <DashboardShell
      nav={ADMIN_NAV_GROUPS}
      title="Professeurs"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      <div className="mb-6">
        <TeacherForm />
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Liste ({teachers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-muted">
                <th className="pb-3 font-medium">Identifiant</th>
                <th className="pb-3 font-medium">Nom</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    Aucun professeur enregistré.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-card-border/50 last:border-0"
                  >
                    <td className="py-3 font-mono text-xs">{t.identifier}</td>
                    <td className="py-3">
                      {t.firstName} {t.lastName}
                    </td>
                    <td className="py-3 text-muted">{t.email}</td>
                    <td className="py-3">
                      {!t.isActive ? (
                        <Badge variant="danger">Désactivé</Badge>
                      ) : t.mustChangePassword ? (
                        <Badge variant="warning">MDP par défaut</Badge>
                      ) : (
                        <Badge variant="success">Actif</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
