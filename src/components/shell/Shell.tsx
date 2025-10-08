"use client";

import * as React from "react";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import { useLayoutEffect } from "react";

const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 80;

export default function Shell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [padLeft, setPadLeft] = React.useState<number>(0); // padding-left do main no desktop

  const isDesktop = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;

  const applyLeftFromStorage = () => {
    if (!isDesktop()) return setPadLeft(0);
    try {
      const raw = localStorage.getItem("sidebar:collapsed");
      const collapsed = raw ? JSON.parse(raw) : false;
      setPadLeft(collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED);
    } catch {
      setPadLeft(WIDTH_EXPANDED);
    }
  };

  useLayoutEffect(() => {
     // inicializa
     applyLeftFromStorage();
     // ouve alterações disparadas pela sidebar
     const onSidebarWidth = (e: Event) => {
       if (!isDesktop()) return setPadLeft(0);
       const detail = (e as CustomEvent).detail as { width?: number };
       if (typeof detail?.width === "number") setPadLeft(detail.width);
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

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      {/* Topbar fixo */}
      <AppTopbar onOpenMenu={() => setMenuOpen(true)} />

      {/* Sidebar: drawer (≤lg) + fixa (≥lg) */}
      <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Conteúdo: compensa topbar e, no desktop, usa padding dinâmico da sidebar */}
      <main
        className="relative z-0 pt-[64px]"
        style={{ paddingLeft: "var(--sidebar-w)" }}
      >
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
