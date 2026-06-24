import type { ReactNode } from "react";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
