import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SubscriptionPanel } from "@/components/admin/subscription-panel";
import { ADMIN_NAV, requireAdmin } from "@/lib/admin/context";

export default async function AdminSubscriptionPage() {
  const { user } = await requireAdmin();

  return (
    <DashboardShell
      nav={ADMIN_NAV}
      title="Abonnement et plan tarifaire"
      userName={`${user.firstName} ${user.lastName}`}
      roleLabel={`Admin — ${user.establishment.name}`}
    >
      <SubscriptionPanel />
    </DashboardShell>
  );
}
