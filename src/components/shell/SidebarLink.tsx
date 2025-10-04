"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

type Props = {
  href: string;
  icon?: LucideIcon;
  active?: boolean;
  children: React.ReactNode;
  collapsed?: boolean;
  className?: string;
};

function SidebarLink({
  href,
  icon: Icon,
  active = false,
  children,
  collapsed = false,
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        active ? "bg-white/20 text-white" : "text-white hover:bg-white/10",
        collapsed ? "justify-center px-2" : "",
        className,
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {Icon ? <Icon size={18} aria-hidden="true" className="shrink-0" /> : null}
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  );
}

export default SidebarLink;
export { SidebarLink };
