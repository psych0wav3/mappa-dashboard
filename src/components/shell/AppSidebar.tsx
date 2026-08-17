"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Rocket,
  Route as RouteIcon,
  Settings as SettingsIcon,
  UserRound,
  Wrench,
} from "lucide-react";

import LabelSlot from "./LabelSlot";
import SidebarDropdown from "./SidebarDropdown";
import { SidebarLink } from "./SidebarLink";
import { getClientRole } from "@/lib/mappa/session";

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

  const [collapsed, setCollapsed] =
    useState<boolean>(() => {
      if (typeof window === "undefined") {
        return false;
      }

      try {
        const raw =
          localStorage.getItem(LS_KEY);

        if (raw !== null) {
          return JSON.parse(raw);
        }
      } catch {}

      const css = getComputedStyle(
        document.documentElement,
      )
        .getPropertyValue("--sidebar-w")
        .trim()
        .replace("px", "");

      const width = parseInt(
        css || "280",
        10,
      );

      return width <= WIDTH_COLLAPSED;
    });

  const [ready, setReady] =
    useState(false);

  useLayoutEffect(() => {
    try {
      const isDesktop =
        window.matchMedia(
          "(min-width: 1024px)",
        ).matches;

      const target = isDesktop
        ? collapsed
          ? WIDTH_COLLAPSED
          : WIDTH_EXPANDED
        : 0;

      const currentCss = getComputedStyle(
        document.documentElement,
      )
        .getPropertyValue("--sidebar-w")
        .trim()
        .replace("px", "");

      const current = parseInt(
        currentCss || "0",
        10,
      );

      if (current !== target) {
        document.documentElement.style.setProperty(
          "--sidebar-w",
          `${target}px`,
        );
      }

      dispatchSidebarWidth(target);
    } catch {}

    setReady(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify(collapsed),
      );
    } catch {}

    const width = collapsed
      ? WIDTH_COLLAPSED
      : WIDTH_EXPANDED;

    dispatchSidebarWidth(width);

    try {
      const isDesktop =
        window.matchMedia(
          "(min-width: 1024px)",
        ).matches;

      if (
        typeof document !== "undefined" &&
        isDesktop
      ) {
        const currentCss =
          getComputedStyle(
            document.documentElement,
          )
            .getPropertyValue(
              "--sidebar-w",
            )
            .trim()
            .replace("px", "");

        const current = parseInt(
          currentCss || "0",
          10,
        );

        if (current !== width) {
          document.documentElement.style.setProperty(
            "--sidebar-w",
            `${width}px`,
          );
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
    if (open) {
      onClose();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity lg:hidden ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[110] w-[80vw] max-w-[320px] text-white shadow-xl transition-transform lg:hidden ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Menu lateral"
        style={{
          background:
            "var(--ac-sidebar-bg)",
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
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
        className={`fixed inset-y-0 left-0 z-[80] hidden flex-col text-white shadow-lg lg:flex ${
          ready
            ? "transition-all duration-300"
            : ""
        }`}
        style={{
          width: "var(--sidebar-w)",
          background:
            "var(--ac-sidebar-bg)",
        }}
        aria-label="Menu lateral"
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          ready={ready}
        />

        <button
          type="button"
          className="absolute -right-3 top-[72px] grid h-8 w-8 place-items-center rounded-full bg-white shadow-md"
          onClick={() =>
            setCollapsed(
              (current) => !current,
            )
          }
          aria-label={
            collapsed
              ? "Expandir sidebar"
              : "Recolher sidebar"
          }
          style={{
            color: "var(--ac-blue-700)",
          }}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </aside>
    </>
  );
}

function dispatchSidebarWidth(
  width: number,
) {
  window.dispatchEvent(
    new CustomEvent("sidebar:width", {
      detail: {
        width,
      },
    }),
  );
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
    {
      href: "/quickstart",
      label: "Início rápido",
      icon: Rocket,
    },
    {
      href: "/dashboard",
      label: "Painel de controle",
      icon: LayoutDashboard,
    },
    {
      href: "/technicians",
      label: "Técnicos",
      icon: Wrench,
    },
    {
      href: "/clients",
      label: "Clientes",
      icon: UserRound,
    },
    {
      href: "/service-plans",
      label: "Rotinas de Atendimento",
      icon: CalendarClock,
    },
  ] as const;

  const routeItems = useMemo(
    () => [
{
      href: "/routes/builder",
      label:
        "Planejamento de rotas",
    },
    {
      href: "/routes/dashboard",
      label:
        "Controle das rotas",
    },
    ],
    [],
  );

  const workorderItems = useMemo(
    () => [
      {
        href: "/workorders",
        label: "Ordens de Serviço",
      },
      {
        href: "/workorders/pricing",
        label:
          "Aguardando Precificação",
      },
      {
        href:
          "/workorders/customer-approval",
        label:
          "Aguardando Aprovação",
      },
    ],
    [],
  );

  const [planLabel, setPlanLabel] =
    useState<string | null>(null);

  useEffect(() => {
    try {
      const role = getClientRole() ?? "COMPANY_ADMIN";

      const labels: Record<string, string> = {
        SUPER_ADMIN: "Super Admin",
        COMPANY_ADMIN: "Admin",
        EMPLOYEE: "Funcionário",
        CUSTOMER: "Cliente",
      };

      setPlanLabel(labels[role] ?? role);
    } catch {
      setPlanLabel(null);
    }
  }, []);

const settingsItems = useMemo(() => [
  {
    href: "/account",
    label: "Dados da empresa",
    icon: Building2,
  },
  {
    href: "/settings/checklist-templates",
    label: "Checklists de Serviço",
    icon: ListChecks,
  },
  {
    href: "/settings/measurement-templates",
    label: "Templates de Medição",
    icon: CalendarClock,
  },
], []);

  const isWorkordersSection =
    pathname.startsWith(
      "/workorders",
    );

  const [
    workordersOpen,
    setWorkordersOpen,
  ] = useState(
    isWorkordersSection,
  );

  useEffect(() => {
    if (isWorkordersSection) {
      setWorkordersOpen(true);
    }
  }, [isWorkordersSection]);

  const isRoutesSection =
    pathname.startsWith("/routes");

  const [routesOpen, setRoutesOpen] =
    useState(isRoutesSection);

  useEffect(() => {
    if (isRoutesSection) {
      setRoutesOpen(true);
    }
  }, [isRoutesSection]);

  const isSettingsSection =
    pathname.startsWith(
      "/settings",
    ) ||
    pathname.startsWith(
      "/account",
    );

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(
    isSettingsSection,
  );

  useEffect(() => {
    if (isSettingsSection) {
      setSettingsOpen(true);
    }
  }, [isSettingsSection]);

  function renderLink(
    href: string,
    label: string,
    icon: LucideIcon,
  ) {
    const active =
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      );

    if (onNavigate) {
      const Icon = icon;

      return (
        <button
          key={href}
          type="button"
          onClick={() => {
            router.push(href);
            onNavigate();
          }}
          className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
            active
              ? "bg-white/20 text-white"
              : "text-white hover:bg-white/10"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              collapsed
                ? "justify-center"
                : ""
            }`}
          >
            <Icon
              size={18}
              aria-hidden
              className="shrink-0"
            />

            <LabelSlot ready={ready}>
              {label}
            </LabelSlot>
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
        <LabelSlot ready={ready}>
          {label}
        </LabelSlot>
      </SidebarLink>
    );
  }

  async function handleSignOut() {
    try {
      localStorage.removeItem(
        "mappa_access_token",
      );

      localStorage.removeItem(
        "mappa_user",
      );

      localStorage.removeItem(
        "mappa_company_id",
      );

      localStorage.removeItem(
        "mappa_company_name",
      );

      localStorage.removeItem(
        "mappa_roles",
      );

      localStorage.removeItem(
        "mappa_role",
      );

      document.cookie =
        "mappa_access_token=; path=/; max-age=0; SameSite=Lax";

      document.cookie =
        "mappa_company_id=; path=/; max-age=0; SameSite=Lax";

      document.cookie =
        "mappa_role=; path=/; max-age=0; SameSite=Lax";

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
        className={`flex h-[64px] items-center gap-3 border-b border-white/20 px-4 ${
          collapsed
            ? "justify-center"
            : ""
        }`}
      >
        <div
          className="grid h-10 w-10 select-none place-items-center rounded-lg bg-white text-lg font-bold"
          style={{
            color:
              "var(--ac-blue-700)",
          }}
        >
          A
        </div>

        <LabelSlot ready={ready}>
          <span className="text-lg font-semibold text-white">
            Aqua Mappa
          </span>
        </LabelSlot>
      </div>

      {planLabel && (
        <div
          className={`px-4 pt-2 ${
            collapsed
              ? "flex justify-center"
              : ""
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[0.7rem] font-medium text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.4)]" />

            {collapsed ? (
              <span>{planLabel}</span>
            ) : (
              <span>
                Plano {planLabel} ativo
              </span>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {links.map((link) =>
          renderLink(
            link.href,
            link.label,
            link.icon,
          ),
        )}

        <SidebarDropdown
          id="workorders-submenu"
          label="Ordens de Serviço"
          icon={ClipboardList}
          collapsed={collapsed}
          ready={ready}
          open={workordersOpen}
          setOpen={
            setWorkordersOpen
          }
          active={
            isWorkordersSection
          }
          defaultHref="/workorders"
          items={workorderItems}
          pathname={pathname}
          onNavigate={onNavigate}
          maxHeight={520}
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
          defaultHref="/account"
          items={settingsItems}
          pathname={pathname}
          onNavigate={onNavigate}
          maxHeight={500}
        />

        {!collapsed && (
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-3 mt-2 flex w-[calc(100%-0.75rem)] items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
          >
            <LogOut
              size={18}
              className="shrink-0"
            />

            Sair
          </button>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 grid h-9 w-full place-items-center rounded-lg text-white/90 hover:bg-white/10"
            title="Sair"
          >
            <LogOut
              size={18}
              className="shrink-0"
            />
          </button>
        )}
      </nav>

      <div
        className={`border-t border-white/20 p-4 text-xs text-white/80 ${
          collapsed
            ? "text-center"
            : ""
        }`}
      >
        <span suppressHydrationWarning>
          © {new Date().getFullYear()}{" "}
          Aqua Mappa
        </span>
      </div>
    </div>
  );
}