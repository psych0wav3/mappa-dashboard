"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { SidebarLink } from "./SidebarLink";
import LabelSlot from "./LabelSlot";

export type SidebarDropdownItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/settings") {
    return pathname === "/settings";
  }

  if (href === "/workorders") {
    return pathname === "/workorders";
  }

  if (href === "/account") {
    return pathname === "/account" || pathname.startsWith("/account/");
  }

  return pathname === href || pathname.startsWith(href + "/");
}

export default function SidebarDropdown({
  id,
  label,
  icon: Icon,
  collapsed,
  ready,
  open,
  setOpen,
  active,
  defaultHref,
  items,
  pathname,
  onNavigate,
  maxHeight = 800,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  ready: boolean;
  open: boolean;
  setOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  active: boolean;
  defaultHref: string;
  items: SidebarDropdownItem[];
  pathname: string;
  onNavigate?: () => void;
  maxHeight?: number;
}) {
  const router = useRouter();

  function handleToggle() {
    if (collapsed) {
      router.push(defaultHref);
      onNavigate?.();
      return;
    }

    setOpen((value) => !value);
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center ${
          collapsed ? "justify-center px-2 gap-0" : "justify-between px-3 gap-3"
        } py-2 rounded-md transition-colors ${
          active ? "bg-white/20 text-white" : "text-white hover:bg-white/10"
        }`}
        aria-expanded={open}
        aria-controls={id}
      >
        <div className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}>
          <Icon size={18} aria-hidden className="shrink-0" />
          <LabelSlot ready={ready} collapsed={collapsed}>{label}</LabelSlot>
        </div>

        <div
          style={{
            width: collapsed ? 0 : 20,
            opacity: collapsed ? 0 : 1,
            overflow: "hidden",
            transition: ready ? "width 300ms ease, opacity 300ms ease" : "none",
          }}
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </div>
      </button>

      <div
        id={id}
        role="menu"
        className="mt-1"
        style={{
          maxHeight: open ? maxHeight : 0,
          overflow: "hidden",
          transition: ready
            ? "max-height 300ms ease, opacity 300ms ease"
            : "none",
          opacity: collapsed ? 0 : open ? 1 : 0,
          pointerEvents: open && !collapsed ? "auto" : "none",
        }}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            {items.map((item) => {
              const activeItem = isItemActive(pathname, item.href);
              const initial = item.label.trim().charAt(0).toUpperCase();

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={[
                    "grid h-7 w-7 place-items-center rounded-md text-xs font-semibold",
                    activeItem
                      ? "bg-white/30 text-white"
                      : "bg-white/20 text-white",
                  ].join(" ")}
                  aria-current={activeItem ? "page" : undefined}
                  title={item.label}
                >
                  {initial}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1" role="menu">
            {items.map((item) => {
              const activeItem = isItemActive(pathname, item.href);
              const ItemIcon = item.icon;

              return (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  active={activeItem}
                  collapsed={false}
                  className="ml-8 text-sm"
                  icon={ItemIcon}
                >
                  {item.label}
                </SidebarLink>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}