import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireAdmin } from "@/lib/admin/context";
import { onboardingService } from "@/lib/services/onboarding.service";

export default async function AdminOnboardingPage() {
  const { user } = await requireAdmin();
  const status = await onboardingService.getStatus(user.establishmentId);

  if (status.isComplete) {
    redirect("/admin/dashboard");
  }

  return (
    <OnboardingWizard
      initialStatus={status}
      userName={`${user.firstName} ${user.lastName}`}
    />
  );
}
