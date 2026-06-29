import type { NavGroupConfig } from "@/lib/navigation/nav-types";

export const SUPER_ADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Vue d'ensemble",
    items: [
      {
        href: "/super-admin/dashboard",
        label: "Tableau de bord",
        icon: "layout-dashboard",
      },
      {
        href: "/super-admin/dashboard#statistiques",
        label: "Statistiques",
        icon: "bar-chart-3",
      },
    ],
  },
  {
    label: "Plateforme",
    items: [
      {
        href: "/super-admin/establishments",
        label: "Établissements",
        icon: "building-2",
      },
      {
        href: "/super-admin/plans",
        label: "Plans tarifaires",
        icon: "credit-card",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        href: "/super-admin/feedbacks",
        label: "Feedbacks",
        icon: "message-square",
      },
    ],
  },
];

export const SUPER_ADMIN_NAV = SUPER_ADMIN_NAV_GROUPS.flatMap((g) => g.items);
