import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
}

interface DashboardShellProps {
  children: ReactNode;
  nav: NavItem[];
  title: string;
  userName: string;
  roleLabel: string;
}

export function DashboardShell({
  children,
  nav,
  title,
  userName,
  roleLabel,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-card-border bg-card p-6 lg:flex">
        <Logo size={32} />
        <p className="mt-2 text-xs text-muted">{roleLabel}</p>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="POST" className="mt-auto">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-foreground"
          >
            Déconnexion
          </button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-card-border px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted">{userName}</p>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
