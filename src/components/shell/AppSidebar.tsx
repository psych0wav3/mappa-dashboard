"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import LabelSlot from "./LabelSlot";
import SidebarDropdown from "./SidebarDropdown";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Route as RouteIcon,
  Rocket,
  Wrench,
  UserRound,
  LogOut,
  User as UserIcon,
  Cog,
  ClipboardList,
  ListChecks,
  Droplets,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useLayoutEffect } from "react";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const routeItems = useMemo(
    () => [
      { href: "/routes/builder", label: "Criar rota" },
      { href: "/routes/dashboard", label: "Controle das rotas" },
    ],
    [],
  );

  const workorderItems = useMemo(
    () => [
      { href: "/workorders/new", label: "Nova OS" },
      { href: "/workorders/approved", label: "OS Aprovadas" },
      { href: "/workorders", label: "Todas as OS" },
    ],
    [],
  );

  const settingsItems = useMemo(
    () => [
      { href: "/account", label: "Meu perfil", icon: UserIcon },
      { href: "/settings", label: "Preferências", icon: Cog },
      {
        href: "/settings/checklist-templates",
        label: "Checklists de Serviço",
        icon: ListChecks,
      },
      {
        href: "/settings/measurement-fields",
        label: "Campos de Medição",
        icon: Droplets,
      },
    ],
    [],
  );

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
      localStorage.removeItem("mappa_roles");

      document.cookie =
        "mappa_access_token=; path=/; max-age=0; SameSite=Lax";
      document.cookie =
        "mappa_company_id=; path=/; max-age=0; SameSite=Lax";

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

        <SidebarDropdown
          id="workorders-submenu"
          label="Ordens de Serviço"
          icon={ClipboardList}
          collapsed={collapsed}
          ready={ready}
          open={workordersOpen}
          setOpen={setWorkordersOpen}
          active={isWorkordersSection}
          defaultHref="/workorders"
          items={workorderItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        <SidebarDropdown
          id="routes-submenu"
          label="Rotas"
          icon={RouteIcon}
          collapsed={collapsed}
          ready={ready}
          open={routesOpen}
          setOpen={setRoutesOpen}
          active={isRoutesSection}
          defaultHref="/routes/dashboard"
          items={routeItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        <SidebarDropdown
          id="settings-submenu"
          label="Configurações"
          icon={SettingsIcon}
          collapsed={collapsed}
          ready={ready}
          open={settingsOpen}
          setOpen={setSettingsOpen}
          active={isSettingsSection}
          defaultHref="/settings"
          items={settingsItems}
          pathname={pathname}
          onNavigate={onNavigate}
          maxHeight={500}
        />

        {!collapsed && (
          <button
            onClick={handleSignOut}
            className="ml-3 mt-2 flex w-[calc(100%-0.75rem)] items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
          >
            <LogOut size={18} className="shrink-0" />
            Sair
          </button>
        )}

        {collapsed && (
          <button
            onClick={handleSignOut}
            className="mt-2 grid h-9 w-full place-items-center rounded-lg text-white/90 hover:bg-white/10"
            title="Sair"
          >
            <LogOut size={18} className="shrink-0" />
          </button>
        )}
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