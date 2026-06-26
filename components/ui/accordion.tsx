"use client";

import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

type AccordionContextValue = {
  openItems: string[];
  toggle: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string>("");

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within Accordion");
  return ctx;
}

function useAccordionItem() {
  return useContext(AccordionItemContext);
}

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export function Accordion({
  type = "multiple",
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const openItems = controlledValue ?? uncontrolled;

  function toggle(item: string) {
    let next: string[];
    if (type === "multiple") {
      next = openItems.includes(item)
        ? openItems.filter((v) => v !== item)
        : [...openItems, item];
    } else {
      next = openItems.includes(item) ? [] : [item];
    }
    onValueChange?.(next);
    if (controlledValue === undefined) setUncontrolled(next);
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { openItems, toggle } = useAccordion();
  const value = useAccordionItem();
  const open = openItems.includes(value);

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full items-center justify-between gap-4 text-left",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { openItems } = useAccordion();
  const value = useAccordionItem();
  const open = openItems.includes(value);

  if (!open) return null;

  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}
