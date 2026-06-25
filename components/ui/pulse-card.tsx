"use client";

import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  variant?: "emerald" | "blue" | "purple" | "amber" | "rose";
  size?: "sm" | "md" | "lg";
  glowEffect?: boolean;
  hoverScale?: number;
  interactive?: boolean;
}

const VARIANTS = {
  emerald: {
    color: "rgb(16 185 129)",
    shine:
      "205deg, transparent 0deg, hsl(160deg 95% 39%) 20deg, hsl(160deg 100% 85% / 0.3) 280deg",
    hoverGlow: "group-hover:before:bg-emerald-500/10",
  },
  blue: {
    color: "rgb(56 189 248)",
    shine:
      "205deg, transparent 0deg, hsl(200deg 95% 45%) 20deg, hsl(200deg 100% 85% / 0.3) 280deg",
    hoverGlow: "group-hover:before:bg-sky-500/10",
  },
  purple: {
    color: "rgb(167 139 250)",
    shine:
      "205deg, transparent 0deg, hsl(270deg 95% 55%) 20deg, hsl(270deg 100% 85% / 0.3) 280deg",
    hoverGlow: "group-hover:before:bg-violet-500/10",
  },
  amber: {
    color: "rgb(251 191 36)",
    shine:
      "205deg, transparent 0deg, hsl(40deg 95% 50%) 20deg, hsl(40deg 100% 85% / 0.3) 280deg",
    hoverGlow: "group-hover:before:bg-amber-500/10",
  },
  rose: {
    color: "rgb(244 63 94)",
    shine:
      "205deg, transparent 0deg, hsl(340deg 95% 55%) 20deg, hsl(340deg 100% 85% / 0.3) 280deg",
    hoverGlow: "group-hover:before:bg-rose-500/10",
  },
};

const SIZES = {
  sm: {
    padding: "p-6 pt-12",
    iconSize: "h-5 w-5",
    titleSize: "text-sm",
    descSize: "text-xs",
  },
  md: {
    padding: "p-8 pt-16",
    iconSize: "h-6 w-6",
    titleSize: "text-base",
    descSize: "text-[15px]",
  },
  lg: {
    padding: "p-6 pt-16",
    iconSize: "h-7 w-7",
    titleSize: "text-lg",
    descSize: "text-base",
  },
};

export function CardHoverEffect({
  icon,
  title,
  description,
  className,
  variant = "emerald",
  size = "md",
  glowEffect = false,
  hoverScale = 1.02,
  interactive = true,
}: CardProps) {
  const variantConfig = VARIANTS[variant];
  const sizeConfig = SIZES[size];

  const Div = interactive ? motion.div : "div";
  const IconWrapper = interactive ? motion.span : "span";

  return (
    <Div
      whileHover={interactive ? { scale: hoverScale } : undefined}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "group relative isolate z-30 w-full overflow-hidden rounded-2xl border border-card-border",
        "bg-card backdrop-blur-xl",
        "shadow-[0px_3px_8px_var(--card-shadow-color),0px_12px_20px_var(--card-shadow-color)]",
        "hover:shadow-[0px_5px_15px_var(--card-shadow-color),0px_25px_35px_var(--card-shadow-color)]",
        sizeConfig.padding,
        className,
      )}
      style={{ "--card-color": variantConfig.color } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          padding: "2px",
        }}
      >
        <div
          className="border-beam-spin absolute inset-[-200%] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 340deg, var(--card-color) 360deg)",
          }}
        />
      </div>

      <IconWrapper
        className="relative z-50 table rounded-xl pb-2"
        whileHover={interactive ? { scale: 1.1 } : undefined}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <span
          className={cn(
            "absolute inset-[4.5px] rounded-[inherit]",
            "bg-gradient-to-b from-surface-subtle to-transparent backdrop-blur-3xl",
            "transition-all duration-300",
          )}
        />
        <span
          className={cn(
            "relative z-[1] block text-muted transition-colors duration-300",
            "group-hover:text-[var(--card-color)]",
            sizeConfig.iconSize,
          )}
        >
          {icon}
        </span>
      </IconWrapper>

      <div className="relative z-30 mt-2">
        <h3
          className={cn(
            "font-medium text-foreground transition-colors duration-300",
            "group-hover:text-[var(--card-color)]",
            sizeConfig.titleSize,
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-1 text-muted transition-colors duration-300",
            sizeConfig.descSize,
          )}
        >
          {description}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] opacity-50">
        <div
          className="absolute bottom-[55%] left-1/2 aspect-square w-[200%] -translate-x-1/2 rounded-[50%]"
          style={{
            background: `conic-gradient(from ${variantConfig.shine}, transparent 360deg)`,
            filter: "blur(40px)",
          }}
        />
      </div>
    </Div>
  );
}
