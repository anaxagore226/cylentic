import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { NavGroupConfig } from "@/lib/navigation/nav-types";
import { cn } from "@/lib/utils/cn";

interface DashboardShellProps {
  children: ReactNode;
  nav: NavGroupConfig[];
  title: string;
  userName: string;
  roleLabel: string;
  headerExtra?: ReactNode;
}

export function DashboardShell({
  children,
  nav,
  title,
  userName,
  roleLabel,
  headerExtra,
}: DashboardShellProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden h-screen w-64 flex-col border-r border-card-border bg-card lg:flex">
        <div className="shrink-0 border-b border-card-border p-6">
          <Logo size={32} />
          <p className="mt-2 text-xs text-muted">{roleLabel}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          <DashboardNav groups={nav} />
        </div>

        <div className="shrink-0 border-t border-card-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface-subtle px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted">Connecté</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST" className="mt-2">
            <button
              type="submit"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-card-border bg-background/80 px-6 py-4 backdrop-blur-md">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted lg:hidden">{userName}</p>
          </div>
          <div className="flex items-center gap-3">
            {headerExtra}
            <ThemeToggle />
          </div>
        </header>
        <main className={cn("flex-1 p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}
