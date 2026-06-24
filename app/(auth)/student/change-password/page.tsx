import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <ChangePasswordForm />
    </div>
  );
}
