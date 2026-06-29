export type NavIconName =
  | "layout-dashboard"
  | "bar-chart-3"
  | "file-text"
  | "plus-circle"
  | "line-chart"
  | "radio"
  | "book-open"
  | "calendar-range"
  | "graduation-cap"
  | "users"
  | "shield"
  | "scroll-text"
  | "credit-card"
  | "building-2"
  | "message-square";

export interface NavItemConfig {
  href: string;
  label: string;
  icon: NavIconName;
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}
