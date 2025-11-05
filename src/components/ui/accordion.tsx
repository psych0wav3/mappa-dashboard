"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Tipos */
type AccordionType = "single";

type AccordionContextType = {
  type: AccordionType;
  collapsible?: boolean;
  openItem?: string;
  setOpenItem: (v: string | undefined) => void;
};

type AccordionItemContextType = {
  value: string;
};

/** Contextos */
const AccordionContext = React.createContext<AccordionContextType | null>(null);
const AccordionItemContext = React.createContext<AccordionItemContextType | null>(null);

/** Raiz */
export function Accordion({
  type = "single",
  collapsible = true,
  value,
  onValueChange,
  className,
  children,
}: {
  type?: AccordionType;
  collapsible?: boolean;
  value?: string;
  onValueChange?: (v: string | undefined) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState<string | undefined>(value);

  React.useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  const setOpenItem = (v: string | undefined) => {
    onValueChange?.(v);
    if (value === undefined) setInternal(v);
  };

  return (
    <AccordionContext.Provider
      value={{ type, collapsible, openItem: internal, setOpenItem }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

/** Item */
export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div data-value={value} className={cn("group/acc-item", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

/** Trigger */
export function AccordionTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const acc = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);
  if (!acc || !item) throw new Error("AccordionTrigger must be inside <AccordionItem>.");

  const isOpen = acc.openItem === item.value; // sempre boolean
  const toggle = () => {
    if (acc.type === "single") {
      if (acc.collapsible && isOpen) acc.setOpenItem(undefined);
      else acc.setOpenItem(item.value);
    }
  };

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      onClick={toggle}
      className={cn(
        "flex w-full items-center gap-2 text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-sky-500/60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Content com animação de altura e sem vazamento */
export function AccordionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const acc = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);
  if (!acc || !item) throw new Error("AccordionContent must be inside <AccordionItem>.");

  const isOpen = acc.openItem === item.value;

  const ref = React.useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = React.useState<number | "auto">(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;

    if (isOpen) {
      // Abre: anima até altura e depois libera (auto)
      setMaxH(inner.scrollHeight);
      const id = window.setTimeout(() => setMaxH("auto"), 200);
      return () => window.clearTimeout(id);
    } else {
      // Fecha: anima de altura atual até 0
      setMaxH(inner.scrollHeight);
      requestAnimationFrame(() => setMaxH(0));
    }
  }, [isOpen]);

  return (
    <div
      ref={ref}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out will-change-[max-height,opacity]",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      style={{ maxHeight: maxH === "auto" ? undefined : maxH }}
      aria-hidden={!isOpen}
    >
      <div className={isOpen ? "pt-1" : "pt-0"}>{children}</div>
    </div>
  );
}
