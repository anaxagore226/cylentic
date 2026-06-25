import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SUPER_ADMIN_NAV } from "@/lib/super-admin/context";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-card-border bg-card p-6">
        <Logo size={32} />
        <p className="mt-2 text-xs text-accent">Super Administrateur</p>
        <nav className="mt-8 flex flex-col gap-1">
          {SUPER_ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-subtle hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 pt-8">
          <ThemeToggle className="w-full justify-center" showLabel />
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface-subtle"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
