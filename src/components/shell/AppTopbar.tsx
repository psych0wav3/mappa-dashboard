"use client";

import Link from "next/link";
import { LogOut, User, Settings, Menu, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { createClientBrowser } from "@/lib/supabase/client";
import * as React from "react";
import { useLayoutEffect } from "react";

const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 80;

export default function AppTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [left, setLeft] = React.useState<number>(0); // deslocamento da sidebar (desktop)

  const isDesktop = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;

  const applyLeftFromStorage = () => {
    if (!isDesktop()) return setLeft(0);
    try {
      const raw = localStorage.getItem("sidebar:collapsed");
      const collapsed = raw ? JSON.parse(raw) : false;
      setLeft(collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED);
    } catch {
      setLeft(WIDTH_EXPANDED);
    }
  };

  useLayoutEffect(() => {
     applyLeftFromStorage();
     const onSidebarWidth = (e: Event) => {
       if (!isDesktop()) return setLeft(0);
       const detail = (e as CustomEvent).detail as { width?: number };
       if (typeof detail?.width === "number") setLeft(detail.width);
     };
     const onResize = () => applyLeftFromStorage();
     const onStorage = (e: StorageEvent) => {
       if (e.key === "sidebar:collapsed") applyLeftFromStorage();
     };
     window.addEventListener("sidebar:width", onSidebarWidth as EventListener);
     window.addEventListener("resize", onResize);
     window.addEventListener("storage", onStorage);
     return () => {
       window.removeEventListener("sidebar:width", onSidebarWidth as EventListener);
       window.removeEventListener("resize", onResize);
       window.removeEventListener("storage", onStorage);
     };
   }, []);

  async function handleSignOut() {
    const supabase = createClientBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    // ocupa da borda direita da sidebar até a direita da tela
    <header
      className="fixed top-0 right-0 z-[90] h-[64px] border-b bg-white/80 backdrop-blur"
      style={{ left: "var(--sidebar-w)" }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-3 lg:px-6">
        {/* Hambúrguer só em mobile/tablet */}
        <button
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-neutral-100 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        {/* empurra a direita (desktop) / ocupa espaço (mobile) */}
        <div className="flex-1" />

        {/* Conta (fica imediatamente após a busca) */}
        <div className="relative ml-2 group">
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-100">
            <Avatar name="Admin" />
            <span className="hidden text-sm lg:inline">Conta</span>
          </button>
          <div className="absolute right-0 mt-2 hidden w-44 overflow-hidden rounded-md border bg-white shadow-lg group-hover:block">
            <Link
              href="/account"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              <User size={16} /> Meu perfil
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              <Settings size={16} /> Configurações
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
