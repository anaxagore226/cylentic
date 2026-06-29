import type { NavGroupConfig } from "@/lib/navigation/nav-types";

export const TEACHER_NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/teacher/dashboard", label: "Tableau de bord", icon: "layout-dashboard" },
      {
        href: "/teacher/dashboard#statistiques",
        label: "Statistiques",
        icon: "bar-chart-3",
      },
    ],
  },
  {
    label: "Examens",
    items: [
      { href: "/teacher/exams", label: "Mes examens", icon: "file-text" },
      { href: "/teacher/exams/new", label: "Créer un examen", icon: "plus-circle" },
    ],
  },
  {
    label: "Suivi",
    items: [
      {
        href: "/teacher/dashboard#activite",
        label: "Activité récente",
        icon: "line-chart",
      },
      {
        href: "/teacher/dashboard#live",
        label: "Examens actifs",
        icon: "radio",
      },
    ],
  },
];

export const TEACHER_NAV = TEACHER_NAV_GROUPS.flatMap((g) => g.items);
