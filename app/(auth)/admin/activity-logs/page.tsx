import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV_GROUPS, requireAdmin } from "@/lib/admin/context";

export default async function AdminActivityLogsPage() {
  const { user } = await requireAdmin();

  const logs = await prisma.adminActivityLog.findMany({
    where: { establishmentId: user.establishmentId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { firstName: true, lastName: true, identifier: true } },
    },
  });

  return (
    <DashboardShell
      nav={ADMIN_NAV_GROUPS}
      title="Journal d'activité"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      <Card>
        <ul className="divide-y divide-card-border">
          {logs.length === 0 ? (
            <li className="py-4 text-sm text-muted">Aucune activité.</li>
          ) : (
            logs.map((log) => (
              <li key={log.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs text-accent">
                    {log.action}
                  </span>
                  <time className="text-xs text-muted">
                    {log.createdAt.toLocaleString("fr-FR")}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {log.actor
                    ? `${log.actor.firstName} ${log.actor.lastName} (${log.actor.identifier})`
                    : "Système"}
                </p>
              </li>
            ))
          )}
        </ul>
      </Card>
    </DashboardShell>
  );
}
