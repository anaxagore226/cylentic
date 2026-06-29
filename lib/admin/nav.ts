import type { NavGroupConfig } from "@/lib/navigation/nav-types";

export const ADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/admin/dashboard", label: "Tableau de bord", icon: "layout-dashboard" },
      {
        href: "/admin/dashboard#statistiques",
        label: "Statistiques",
        icon: "bar-chart-3",
      },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/admin/classes", label: "Classes", icon: "book-open" },
      { href: "/admin/academic-years", label: "Années académiques", icon: "calendar-range" },
      { href: "/admin/students", label: "Étudiants", icon: "graduation-cap" },
      { href: "/admin/teachers", label: "Professeurs", icon: "users" },
      { href: "/admin/admins", label: "Administrateurs", icon: "shield" },
    ],
  },
  {
    label: "Exploitation",
    items: [
      { href: "/admin/activity-logs", label: "Journal d'activité", icon: "scroll-text" },
      { href: "/admin/subscription", label: "Abonnement", icon: "credit-card" },
    ],
  },
];

export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
