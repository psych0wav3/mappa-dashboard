"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import {
  LayoutDashboard,
  ListChecks,
  Camera,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Route as RouteIcon,
  Rocket,
  Wrench,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const LS_KEY = "sidebar:collapsed";
const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 80;

export default function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const col = raw ? JSON.parse(raw) : false;
      setCollapsed(col);
      dispatchSidebarWidth(col ? WIDTH_COLLAPSED : WIDTH_EXPANDED);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(collapsed));
    } catch {}
    dispatchSidebarWidth(collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED);
  }, [collapsed]);

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Overlay mobile/tablet */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer mobile/tablet */}
      <aside
        className={`fixed inset-y-0 left-0 z-[110] w-[80vw] max-w-[320px] bg-[#0077C8] text-white shadow-xl lg:hidden
          transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-label="Menu lateral"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <SidebarContent pathname={pathname} collapsed={false} onNavigate={onClose} />
      </aside>

      {/* Sidebar fixa (desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-[80] hidden lg:flex lg:flex-col bg-[#0077C8] text-white shadow-lg transition-all duration-300
        ${collapsed ? "w-[80px]" : "w-[280px]"}`}
        aria-label="Menu lateral"
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />

        {/* ⬇️ só movi a posição vertical: top-[72px] */}
        <button
          className="absolute -right-3 top-[72px] grid h-8 w-8 place-items-center rounded-full bg-white text-[#0077C8] shadow-md"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>
    </>
  );
}

function dispatchSidebarWidth(width: number) {
  window.dispatchEvent(new CustomEvent("sidebar:width", { detail: { width } }));
}

function SidebarContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void; // fecha o drawer no mobile/tablet
}) {
  const router = useRouter();

  const links = [
    { href: "/quickstart", label: "Início rápido", icon: Rocket },
    { href: "/dashboard", label: "Painel de controle", icon: LayoutDashboard },
    { href: "/technicians", label: "Técnicos", icon: Wrench },
    { href: "/clients", label: "Clientes", icon: UserRound },
  ] as const;

  const tail = [
    { href: "/visits", label: "Visitas", icon: ListChecks },
    { href: "/gallery", label: "Fotos", icon: Camera },
    { href: "/settings", label: "Configurações", icon: Settings },
  ] as const;

  const isRoutesSection = pathname.startsWith("/routes");
  const [routesOpen, setRoutesOpen] = useState<boolean>(isRoutesSection);
  useEffect(() => {
    if (isRoutesSection) setRoutesOpen(true);
  }, [isRoutesSection]);

  const routeItems = useMemo(
    () => [
      { href: "/routes/builder", label: "Criar rota" },
      { href: "/routes/assignments", label: "Atribuir rota" },
      { href: "/routes/dashboard", label: "Dashboard da rota" },
    ],
    []
  );

  const renderLink = (href: string, label: string, icon: LucideIcon) => {
    const active = pathname === href || pathname.startsWith(href + "/");

    if (onNavigate) {
      const IconCmp = icon as LucideIcon;
      return (
        <button
          key={href}
          type="button"
          onClick={() => {
            router.push(href);
            onNavigate();
          }}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            active ? "bg-white/20 text-white" : "text-white hover:bg-white/10"
          }`}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            {IconCmp ? <IconCmp size={18} aria-hidden className="shrink-0" /> : null}
            {!collapsed && <span className="text-[0.95rem] font-medium">{label}</span>}
          </div>
        </button>
      );
    }

    return (
      <SidebarLink
        key={href}
        href={href}
        icon={icon}
        active={active}
        collapsed={collapsed}
      >
        <span className="text-[0.95rem] font-medium">{label}</span>
      </SidebarLink>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 h-[64px] border-b border-white/20 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="h-10 w-10 rounded-lg bg-white text-[#0077C8] grid place-items-center text-lg font-bold select-none">
          P
        </div>
        {!collapsed && <div className="font-semibold text-white text-lg">Aqua Check</div>}
      </div>

      {/* Links */}
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => renderLink(l.href, l.label, l.icon))}

        {/* Grupo: Rotas */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                router.push("/routes/dashboard");
                onNavigate?.();
              } else {
                setRoutesOpen((v) => !v);
              }
            }}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } gap-3 px-3 py-2 rounded-md transition-colors ${
              isRoutesSection ? "bg-white/20 text-white" : "text-white hover:bg-white/10"
            }`}
            aria-expanded={routesOpen}
            aria-controls="routes-submenu"
          >
            <div className="flex items-center gap-3">
              <RouteIcon size={18} aria-hidden className="shrink-0" />
              {!collapsed && <span className="text-[0.95rem] font-medium">Rotas</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                size={16}
                className={`transition-transform ${routesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            )}
          </button>

          {!collapsed && routesOpen && (
            <div id="routes-submenu" className="mt-1 space-y-1" role="menu">
              {routeItems.map((it) => {
                const active =
                  pathname === it.href || pathname.startsWith(it.href + "/");
                return (
                  <SidebarLink
                    key={it.href}
                    href={it.href}
                    active={active}
                    collapsed={false}
                    className="ml-8 text-sm"
                  >
                    {it.label}
                  </SidebarLink>
                );
              })}
            </div>
          )}
        </div>

        {tail.map((l) => renderLink(l.href, l.label, l.icon))}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-white/20 text-xs text-white/80 ${collapsed ? "text-center" : ""}`}>
        © {new Date().getFullYear()} Brilho Piscinas
      </div>
    </div>
  );
}
