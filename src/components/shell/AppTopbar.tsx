// src/components/shell/AppTopbar.tsx
"use client";

import { Menu } from "lucide-react";
import * as React from "react";

export default function AppTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
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

        {/* Espaçador */}
        <div className="flex-1" />
      </div>
    </header>
  );
}
