import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentForm } from "@/components/admin/student-form";
import { StudentTable } from "@/components/admin/student-table";
import { userService } from "@/lib/services/user.service";
import { ADMIN_NAV_GROUPS, requireAdmin } from "@/lib/admin/context";

export default async function AdminStudentsPage() {
  const { user } = await requireAdmin();
  const students = await userService.listStudents(user.establishmentId);

  return (
    <DashboardShell
      nav={ADMIN_NAV_GROUPS}
      title="Étudiants"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      <div className="mb-6">
        <StudentForm />
      </div>
      <StudentTable students={students} />
    </DashboardShell>
  );
}
