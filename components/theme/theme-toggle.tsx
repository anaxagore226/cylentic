"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/theme/theme-provider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-card-border bg-card px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-subtle hover:text-foreground",
        className,
      )}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {!mounted ? (
        <span className="size-4" aria-hidden />
      ) : isDark ? (
        <Sun className="size-4 shrink-0 text-amber-400" aria-hidden />
      ) : (
        <Moon className="size-4 shrink-0 text-indigo-500" aria-hidden />
      )}
      {showLabel && (
        <span>{mounted ? (isDark ? "Clair" : "Sombre") : "Thème"}</span>
      )}
    </button>
  );
}
