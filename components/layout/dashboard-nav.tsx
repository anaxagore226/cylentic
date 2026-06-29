"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarRange,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  PlusCircle,
  Radio,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";
import type { NavGroupConfig, NavIconName } from "@/lib/navigation/nav-types";
import { cn } from "@/lib/utils/cn";

const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "bar-chart-3": BarChart3,
  "file-text": FileText,
  "plus-circle": PlusCircle,
  "line-chart": LineChart,
  radio: Radio,
  "book-open": BookOpen,
  "calendar-range": CalendarRange,
  "graduation-cap": GraduationCap,
  users: Users,
  shield: Shield,
  "scroll-text": ScrollText,
  "credit-card": CreditCard,
  "building-2": Building2,
  "message-square": MessageSquare,
};

interface DashboardNavProps {
  groups: NavGroupConfig[];
}

function isActive(pathname: string, href: string) {
  const base = href.split("#")[0];
  const isDashboardRoot =
    base === "/teacher/dashboard" ||
    base === "/admin/dashboard" ||
    base === "/super-admin/dashboard";

  if (isDashboardRoot && href.includes("#")) {
    return pathname === base;
  }
  if (isDashboardRoot) {
    return pathname === base;
  }
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function DashboardNav({ groups }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label ?? "default"}>
          {group.label ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted/70">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = NAV_ICONS[item.icon];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-accent/10 font-medium text-accent shadow-[inset_3px_0_0_0_var(--accent)]"
                      : "text-muted hover:bg-surface-subtle hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-accent" : "text-muted group-hover:text-foreground",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
