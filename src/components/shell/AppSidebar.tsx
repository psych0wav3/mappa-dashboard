"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Route as RouteIcon,
  Rocket,
  Wrench,
  UserRound,
  LogOut,
  User as UserIcon,
  Cog,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useLayoutEffect } from "react";

const LS_KEY = "sidebar:collapsed";
const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 80;

function LabelSlot({
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

export default function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw != null) return JSON.parse(raw);
    } catch {}

    const css = getComputedStyle(document.documentElement)
      .getPropertyValue("--sidebar-w")
      .trim()
      .replace("px", "");

    const w = parseInt(css || "280", 10);
    return w <= WIDTH_COLLAPSED;
  });

  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    try {
      const isDesk = window.matchMedia("(min-width: 1024px)").matches;
      const target = isDesk ? (collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED) : 0;

      const currentCss = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar-w")
        .trim()
        .replace("px", "");

      const current = parseInt(currentCss || "0", 10);

      if (current !== target) {
        document.documentElement.style.setProperty("--sidebar-w", target + "px");
      }

      dispatchSidebarWidth(target);
    } catch {}

    setReady(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(collapsed));
    } catch {}

    const w = collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;
    dispatchSidebarWidth(w);

    try {
      const isDesk = window.matchMedia("(min-width: 1024px)").matches;

      if (typeof document !== "undefined" && isDesk) {
        const currentCss = getComputedStyle(document.documentElement)
          .getPropertyValue("--sidebar-w")
          .trim()
          .replace("px", "");

        const current = parseInt(currentCss || "0", 10);

        if (current !== w) {
          document.documentElement.style.setProperty("--sidebar-w", w + "px");
        }
      }
    } catch {}

    try {
      document.cookie = `sb-collapsed=${
        collapsed ? "1" : "0"
      }; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-black/40 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[110] w-[80vw] max-w-[320px] text-white shadow-xl lg:hidden
          transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-label="Menu lateral"
        style={{ background: "var(--ac-sidebar-bg)" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={false}
          onNavigate={onClose}
          ready={ready}
        />
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-[80] hidden lg:flex lg:flex-col text-white shadow-lg ${
          ready ? "transition-all duration-300" : ""
        }`}
        style={{ width: "var(--sidebar-w)", background: "var(--ac-sidebar-bg)" }}
        aria-label="Menu lateral"
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} ready={ready} />

        <button
          className="absolute -right-3 top-[72px] grid h-8 w-8 place-items-center rounded-full bg-white shadow-md"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          style={{ color: "var(--ac-blue-700)" }}
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
  ready,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  ready: boolean;
}) {
  const router = useRouter();

  const links = [
    { href: "/quickstart", label: "Início rápido", icon: Rocket },
    { href: "/dashboard", label: "Painel de controle", icon: LayoutDashboard },
    { href: "/technicians", label: "Técnicos", icon: Wrench },
    { href: "/clients", label: "Clientes", icon: UserRound },
  ] as const;

  const [planLabel, setPlanLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mappa_user");
      if (!raw) return;

      const user = JSON.parse(raw);

      const role =
        user?.roles?.[0]?.role ||
        user?.roles?.[0] ||
        user?.companies?.[0]?.role ||
        user?.companyRoles?.[0]?.role ||
        user?.role ||
        "COMPANY_ADMIN";

      const map: Record<string, string> = {
        SUPER_ADMIN: "Super Admin",
        COMPANY_ADMIN: "Admin",
        EMPLOYEE: "Funcionário",
        CUSTOMER: "Cliente",
      };

      setPlanLabel(map[role] ?? role);
    } catch {
      setPlanLabel(null);
    }
  }, []);

  const isWorkordersSection = pathname.startsWith("/workorders");
  const [workordersOpen, setWorkordersOpen] =
    useState<boolean>(isWorkordersSection);

  useEffect(() => {
    if (isWorkordersSection) setWorkordersOpen(true);
  }, [isWorkordersSection]);

  const isRoutesSection = pathname.startsWith("/routes");
  const [routesOpen, setRoutesOpen] = useState<boolean>(isRoutesSection);

  useEffect(() => {
    if (isRoutesSection) setRoutesOpen(true);
  }, [isRoutesSection]);

  const isSettingsSection =
    pathname.startsWith("/settings") || pathname.startsWith("/account");

  const [settingsOpen, setSettingsOpen] = useState<boolean>(isSettingsSection);

  useEffect(() => {
    if (isSettingsSection) setSettingsOpen(true);
  }, [isSettingsSection]);

  const routeItems = useMemo(
    () => [
      { href: "/routes/builder", label: "Criar rota" },
      { href: "/routes/dashboard", label: "Controle das rotas" },
    ],
    []
  );

  const workorderItems = useMemo(
    () => [
      { href: "/workorders", label: "Dashboard da OS" },
      { href: "/workorders/approved", label: "OS's Aprovadas" },
    ],
    []
  );

  const renderLink = (href: string, label: string, icon: LucideIcon) => {
    const active = pathname === href || pathname.startsWith(href + "/");

    if (onNavigate) {
      const IconCmp = icon;

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
          <div
            className={`flex items-center gap-3 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <IconCmp size={18} aria-hidden className="shrink-0" />
            <LabelSlot ready={ready}>{label}</LabelSlot>
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
        <LabelSlot ready={ready}>{label}</LabelSlot>
      </SidebarLink>
    );
  };

  async function handleSignOut() {
    try {
      localStorage.removeItem("mappa_access_token");
      localStorage.removeItem("mappa_user");
      localStorage.removeItem("mappa_company_id");

      document.cookie =
        "mappa_access_token=; path=/; max-age=0; SameSite=Lax";

      router.push("/login");
      router.refresh();
      onNavigate?.();
    } catch {
      router.push("/login");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center gap-3 px-4 h-[64px] border-b border-white/20 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div
          className="h-10 w-10 rounded-lg bg-white grid place-items-center text-lg font-bold select-none"
          style={{ color: "var(--ac-blue-700)" }}
        >
          A
        </div>

        <LabelSlot ready={ready}>
          <span className="font-semibold text-white text-lg">Aqua Mappa</span>
        </LabelSlot>
      </div>

      {planLabel && (
        <div className={`px-4 pt-2 ${collapsed ? "flex justify-center" : ""}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[0.7rem] font-medium text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.4)]" />
            {collapsed ? (
              <span>{planLabel}</span>
            ) : (
              <span>Plano {planLabel} ativo</span>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1">
        {links.map((link) => renderLink(link.href, link.label, link.icon))}

        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                router.push("/routes/dashboard");
                onNavigate?.();
              } else {
                setRoutesOpen((value) => !value);
              }
            }}
            className={`w-full flex items-center ${
              collapsed
                ? "justify-center px-2 gap-0"
                : "justify-between px-3 gap-3"
            } py-2 rounded-md transition-colors ${
              pathname.startsWith("/routes")
                ? "bg-white/20 text-white"
                : "text-white hover:bg-white/10"
            }`}
            aria-expanded={routesOpen}
            aria-controls="routes-submenu"
          >
            <div
              className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
            >
              <RouteIcon size={18} aria-hidden className="shrink-0" />
              <LabelSlot ready={ready}>Rotas</LabelSlot>
            </div>

            <div
              style={{
                width: "calc(var(--sidebar-w) - 80px)",
                overflow: "hidden",
                transition: ready ? "width 300ms ease" : "none",
              }}
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  routesOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>
          </button>

          <div
            id="routes-submenu"
            role="menu"
            className="mt-1"
            style={{
              maxHeight: routesOpen ? 800 : 0,
              overflow: "hidden",
              transition: ready
                ? "max-height 300ms ease, opacity 300ms ease"
                : "none",
              opacity: "calc((var(--sidebar-w) - 80px) / 200)",
              pointerEvents: routesOpen && !collapsed ? "auto" : "none",
            }}
          >
            {collapsed ? (
              <div className="flex flex-col items-center gap-2 py-1">
                {routeItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  const initial = item.label.trim().charAt(0).toUpperCase();

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={[
                        "grid h-7 w-7 place-items-center rounded-md text-xs font-semibold",
                        active
                          ? "bg-white/30 text-white"
                          : "bg-white/20 text-white",
                      ].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {initial}
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1" role="menu">
                {routeItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <SidebarLink
                      key={item.href}
                      href={item.href}
                      active={active}
                      collapsed={false}
                      className="ml-8 text-sm"
                    >
                      {item.label}
                    </SidebarLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                router.push("/workorders");
                onNavigate?.();
              } else {
                setWorkordersOpen((value) => !value);
              }
            }}
            className={`w-full flex items-center ${
              collapsed
                ? "justify-center px-2 gap-0"
                : "justify-between px-3 gap-3"
            } py-2 rounded-md transition-colors ${
              pathname.startsWith("/workorders")
                ? "bg-white/20 text-white"
                : "text-white hover:bg-white/10"
            }`}
            aria-expanded={workordersOpen}
            aria-controls="workorders-submenu"
          >
            <div
              className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
            >
              <ClipboardList size={18} aria-hidden className="shrink-0" />
              <LabelSlot ready={ready}>Ordem de Serviço</LabelSlot>
            </div>

            <div
              style={{
                width: "calc(var(--sidebar-w) - 80px)",
                overflow: "hidden",
                transition: ready ? "width 300ms ease" : "none",
              }}
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  workordersOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>
          </button>

          <div
            id="workorders-submenu"
            role="menu"
            className="mt-1"
            style={{
              maxHeight: workordersOpen ? 800 : 0,
              overflow: "hidden",
              transition: ready
                ? "max-height 300ms ease, opacity 300ms ease"
                : "none",
              opacity: "calc((var(--sidebar-w) - 80px) / 200)",
              pointerEvents: workordersOpen && !collapsed ? "auto" : "none",
            }}
          >
            {collapsed ? (
              <div className="flex flex-col items-center gap-2 py-1">
                {workorderItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  const initial = item.label.trim().charAt(0).toUpperCase();

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={[
                        "grid h-7 w-7 place-items-center rounded-md text-xs font-semibold",
                        active
                          ? "bg-white/30 text-white"
                          : "bg-white/20 text-white",
                      ].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {initial}
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1" role="menu">
                {workorderItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <SidebarLink
                      key={item.href}
                      href={item.href}
                      active={active}
                      collapsed={false}
                      className="ml-8 text-sm"
                    >
                      {item.label}
                    </SidebarLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                onNavigate?.();
                router.push("/settings");
              } else {
                setSettingsOpen((value) => !value);
              }
            }}
            className={`w-full flex items-center ${
              collapsed
                ? "justify-center px-2 gap-0"
                : "justify-between px-3 gap-3"
            } py-2 rounded-md transition-colors ${
              pathname.startsWith("/settings") || pathname.startsWith("/account")
                ? "bg-white/20 text-white"
                : "text-white hover:bg-white/10"
            }`}
            aria-expanded={settingsOpen}
            aria-controls="settings-submenu"
          >
            <div
              className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
            >
              <SettingsIcon size={18} aria-hidden className="shrink-0" />
              <LabelSlot ready={ready}>Configurações</LabelSlot>
            </div>

            <div
              style={{
                width: "calc(var(--sidebar-w) - 80px)",
                overflow: "hidden",
                transition: ready ? "width 300ms ease" : "none",
              }}
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  settingsOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>
          </button>

          <div
            id="settings-submenu"
            role="menu"
            className="mt-1"
            style={{
              maxHeight: settingsOpen ? 300 : 0,
              overflow: "hidden",
              transition: ready
                ? "max-height 300ms ease, opacity 300ms ease"
                : "none",
              opacity: "calc((var(--sidebar-w) - 80px) / 200)",
              pointerEvents: settingsOpen && !collapsed ? "auto" : "none",
            }}
          >
            {!collapsed && (
              <div className="space-y-1">
                <SidebarLink
                  href="/account"
                  active={pathname.startsWith("/account")}
                  collapsed={false}
                  className="ml-8 text-sm"
                  icon={UserIcon}
                >
                  Meu perfil
                </SidebarLink>

                <SidebarLink
                  href="/settings"
                  active={pathname.startsWith("/settings")}
                  collapsed={false}
                  className="ml-8 text-sm"
                  icon={Cog}
                >
                  Preferências
                </SidebarLink>

                <button
                  onClick={handleSignOut}
                  className="ml-8 flex w-[calc(100%-2rem)] items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                >
                  <LogOut size={18} className="shrink-0" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div
        className={`p-4 border-t border-white/20 text-xs text-white/80 ${
          collapsed ? "text-center" : ""
        }`}
      >
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} Aqua Mappa
        </span>
      </div>
    </div>
  );
}