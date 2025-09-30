"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Camera,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer mobile (fica por cima) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0077C8] text-white shadow-lg md:hidden
          transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent pathname={pathname} collapsed={false} />
      </aside>

      {/* Sidebar desktop (faz parte do fluxo, empurra conteúdo) */}
      <aside
        className={`hidden md:flex md:flex-col relative bg-[#0077C8] text-white shadow-lg transition-all duration-300
        ${collapsed ? "w-[80px]" : "w-[280px]"}`}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />

        {/* Botão de collapse */}
        <button
          className="absolute -right-3 top-6 bg-white text-[#0077C8] rounded-full p-1 shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  collapsed,
}: {
  pathname: string;
  collapsed: boolean;
}) {
  const links = [
    { href: "/dashboard", label: "Painel de controle", icon: LayoutDashboard },
    { href: "/clients", label: "Clientes", icon: Users },
    { href: "/technicians", label: "Técnicos", icon: Users },
    { href: "/visits", label: "Visitas", icon: ListChecks },
    { href: "/calendar", label: "Calendário", icon: CalendarDays },
    { href: "/gallery", label: "Fotos", icon: Camera },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 h-[64px] border-b border-white/20 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="h-10 w-10 rounded-lg bg-white text-[#0077C8] grid place-items-center text-lg font-bold">
          P
        </div>
        {!collapsed && (
          <div className="font-semibold text-white text-lg">PiscinApp</div>
        )}
      </div>

      {/* Links */}
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => (
          <SidebarLink
            key={l.href}
            href={l.href}
            icon={l.icon}
            active={pathname.startsWith(l.href)}
            className={`rounded-md transition-colors ${
              pathname.startsWith(l.href)
                ? "bg-white/20 text-white"
                : "text-white hover:bg-white/10"
            }`}
            collapsed={collapsed}
          >
            {l.label}
          </SidebarLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`p-4 border-t border-white/20 text-xs text-white/80 ${
          collapsed ? "text-center" : ""
        }`}
      >
        © {new Date().getFullYear()} Brilho Piscinas
      </div>
    </div>
  );
}
