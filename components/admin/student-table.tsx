import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface StudentRow {
  id: string;
  identifier: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  mustChangePassword: boolean;
  studentProfile: {
    matricule: string;
    class: { name: string } | null;
    academicYear: { label: string } | null;
  } | null;
}

export function StudentTable({ students }: { students: StudentRow[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Identifiant</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Classe</th>
              <th className="px-4 py-3 font-medium">Matricule</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Aucun étudiant enregistré.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-card-border/50 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs">{s.identifier}</td>
                  <td className="px-4 py-3">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s.studentProfile?.class?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s.studentProfile?.matricule ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {!s.isActive ? (
                      <Badge variant="danger">Désactivé</Badge>
                    ) : s.mustChangePassword ? (
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
  );
}
