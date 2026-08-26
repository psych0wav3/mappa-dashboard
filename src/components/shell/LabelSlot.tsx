"use client";

import * as React from "react";

export default function LabelSlot({
  children,
  ready,
  collapsed = false,
}: {
  children: React.ReactNode;
  ready: boolean;
  collapsed?: boolean;
}) {
  return (
    <span
      className="overflow-hidden whitespace-nowrap text-[0.95rem] font-medium"
      style={{
        display: "inline-block",
        maxWidth: collapsed ? 0 : 220,
        opacity: collapsed ? 0 : 1,
        transition: ready
          ? "max-width 300ms ease, opacity 300ms ease"
          : "none",
      }}
    >
      {children}
    </span>
  );
}
