"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import {
  LayoutDashboard,
  Camera,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

const LS_KEY = "sidebar:collapsed";
const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 80;

/** Slot de texto que aparece somente quando var(--sidebar-w) > 80px */
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
        maxWidth: "calc(var(--sidebar-w) - 80px)", // 0 quando fechado (80px)
        transition: ready ? "max-width 300ms ease, opacity 300ms ease" : "none",
        opacity: "calc((var(--sidebar-w) - 80px) / 200)", // 0→1 de 80→280
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

  // Estado inicial: tenta LS; se não houver, infere pela CSS var (definida no <head>)
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
    return w <= WIDTH_COLLAPSED; // 80px => fechado
  });

  // NOVO: controla quando podemos habilitar transições (evita animação no 1º paint)
  const [ready, setReady] = useState(false);

  // Mount: sincroniza CSS var + evento (sem alterar estado → evita ping-pong)
  // e só habilita transições se o valor já está correto.
  useLayoutEffect(() => {
    try {
      const isDesk = window.matchMedia("(min-width: 1024px)").matches;
      const target = isDesk ? (collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED) : 0;

      const currentCss = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar-w")
        .trim()
        .replace("px", "");
      const current = parseInt(currentCss || "0", 10);

      // Só setar se for diferente (evita animação desnecessária)
      if (current !== target) {
        document.documentElement.style.setProperty("--sidebar-w", target + "px");
      }

      // Emite o evento com o valor final
      dispatchSidebarWidth(target);
    } catch {}
    setReady(true); // a partir daqui, pode animar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // apenas no mount

  // Ao alterar collapsed (toggle), persiste e atualiza consumidores
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(collapsed));
    } catch {}
    const w = collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;
    dispatchSidebarWidth(w);
    if (
      typeof document !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      // só aplica se mudou
      const currentCss = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar-w")
        .trim()
        .replace("px", "");
      const current = parseInt(currentCss || "0", 10);
      if (current !== w) {
        document.documentElement.style.setProperty("--sidebar-w", w + "px");
      }
    }
    // Opcional: cookie para SSR (se você adicionou no layout)
    try {
      document.cookie = `sb-collapsed=${collapsed ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  }, [collapsed]);

  // Fecha o drawer mobile ao navegar
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
        className={`fixed inset-y-0 left-0 z-[110] w-[80vw] max-w-[320px] text-white shadow-xl lg:hidden
          transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-label="Menu lateral"
        style={{ background: "var(--ac-sidebar-bg)" }}  // usa a var global
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={false}
          onNavigate={onClose}
          ready={ready}
        />
      </aside>

      {/* Sidebar fixa (desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-[80] hidden lg:flex lg:flex-col text-white shadow-lg ${
          ready ? "transition-all duration-300" : ""}`}
        style={{ width: "var(--sidebar-w)", background: "var(--ac-sidebar-bg)" }} // usa a var global
        aria-label="Menu lateral"
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} ready={ready} />

        {/* Botão de toggle */}
        <button
          className="absolute -right-3 top-[72px] grid h-8 w-8 place-items-center rounded-full bg-white shadow-md"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          style={{ color: "var(--ac-blue-700)" }} // cor do ícone no padrão da marca
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
  onNavigate?: () => void; // fecha o drawer no mobile/tablet
  ready: boolean;
}) {
  const router = useRouter();

  const links = [
    { href: "/quickstart", label: "Início rápido", icon: Rocket },
    { href: "/dashboard", label: "Painel de controle", icon: LayoutDashboard },
    { href: "/technicians", label: "Técnicos", icon: Wrench },
    { href: "/clients", label: "Clientes", icon: UserRound },
  ] as const;

  // ⚠️ Removido "Visitas" aqui
  const tail = [
    { href: "/gallery", label: "Fotos", icon: Camera },
    // Configurações será um GRUPO colapsável logo abaixo
  ] as const;

  const isRoutesSection = pathname.startsWith("/routes");
  const [routesOpen, setRoutesOpen] = useState<boolean>(isRoutesSection);
  useEffect(() => {
    if (isRoutesSection) setRoutesOpen(true);
  }, [isRoutesSection]);

  // Settings (configurações) — grupo colapsável
  const isSettingsSection =
    pathname.startsWith("/settings") || pathname.startsWith("/account");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(isSettingsSection);
  useEffect(() => {
    if (isSettingsSection) setSettingsOpen(true);
  }, [isSettingsSection]);

  const routeItems = useMemo(
    () => [
      { href: "/routes/builder", label: "Criar rota" },
      { href: "/routes/assignments", label: "Atribuir rota" },
      { href: "/routes/dashboard", label: "Controle das rotas" },
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
      const supabase = createClientBrowser();
      await supabase.auth.signOut();
      router.push("/login");
      onNavigate?.();
    } catch {
      // silencioso
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 h-[64px] border-b border-white/20 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div
          className="h-10 w-10 rounded-lg bg-white grid place-items-center text-lg font-bold select-none"
          style={{ color: "var(--ac-blue-700)" }}  // letra “P” na cor da marca
        >
          P
        </div>
        <LabelSlot ready={ready}>
          <span className="font-semibold text-white text-lg">Aqua Check</span>
        </LabelSlot>
      </div>

      {/* Links principais */}
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
              collapsed ? "justify-center px-2 gap-0" : "justify-between px-3 gap-3"
            } py-2 rounded-md transition-colors ${
              isRoutesSection ? "bg-white/20 text-white" : "text-white hover:bg-white/10"
            }`}
            aria-expanded={routesOpen}
            aria-controls="routes-submenu"
          >
            <div className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}>
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
                className={`transition-transform ${routesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Submenu Rotas */}
          <div
            id="routes-submenu"
            role="menu"
            className="mt-1"
            style={{
              maxHeight: routesOpen ? 800 : 0,
              overflow: "hidden",
              transition: ready ? "max-height 300ms ease, opacity 300ms ease" : "none",
              opacity: "calc((var(--sidebar-w) - 80px) / 200)",
              pointerEvents: routesOpen && !collapsed ? "auto" : "none",
            }}
          >
            {collapsed ? (
              <div className="flex flex-col items-center gap-2 py-1">
                {routeItems.map((it) => {
                  const active =
                    pathname === it.href || pathname.startsWith(it.href + "/");
                  const initial = it.label.trim().charAt(0).toUpperCase();
                  return (
                    <a
                      key={it.href}
                      href={it.href}
                      className={[
                        "grid h-7 w-7 place-items-center rounded-md text-xs font-semibold",
                        active ? "bg-white/30 text-white" : "bg-white/20 text-white",
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
        </div>

        {/* Tail (sem Visitas) */}
        {tail.map((l) => renderLink(l.href, l.label, l.icon))}

        {/* Grupo: Configurações (colapsável) */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                router.push("/settings"); // no fechado, navega direto
                onNavigate?.();
              } else {
                setSettingsOpen((v) => !v);
              }
            }}
            className={`w-full flex items-center ${
              collapsed ? "justify-center px-2 gap-0" : "justify-between px-3 gap-3"
            } py-2 rounded-md transition-colors ${
              isSettingsSection ? "bg-white/20 text-white" : "text-white hover:bg-white/10"
            }`}
            aria-expanded={settingsOpen}
            aria-controls="settings-submenu"
          >
            <div className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}>
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
                className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`}
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
              transition: ready ? "max-height 300ms ease, opacity 300ms ease" : "none",
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

                {/* Sair como “link” */}
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

      {/* Footer */}
      <div
        className={`p-4 border-t border-white/20 text-xs text-white/80 ${
          collapsed ? "text-center" : ""
        }`}
      >
        <span suppressHydrationWarning>© {new Date().getFullYear()} Aqua Check</span>
      </div>
    </div>
  );
}
