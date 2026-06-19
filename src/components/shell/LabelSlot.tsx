"use client";

import * as React from "react";

export default function LabelSlot({
  children,
  ready,
}: {
  children: React.ReactNode;
  ready: boolean;
}) {
  return (
    <span
      className="text-[0.95rem] font-medium whitespace-nowrap overflow-hidden"
      style={{
        display: "inline-block",
        maxWidth: "calc(var(--sidebar-w) - 80px)",
        transition: ready ? "max-width 300ms ease, opacity 300ms ease" : "none",
        opacity: "calc((var(--sidebar-w) - 80px) / 200)",
      }}
    >
      {children}
    </span>
  );
}