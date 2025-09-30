"use client";

import Link from "next/link";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AppTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  async function handleSignOut() {
    const supabase = createClientBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-[64px] border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-3 md:px-6">
        {/* menu mobile */}
        <button
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-neutral-100 md:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        {/* busca (placeholder) */}
        <div className="hidden md:flex flex-1">
          <input
            type="search"
            placeholder="Buscar visitas, clientes e técnicos"
            className="w-full max-w-xl rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </div>

        {/* conta */}
        <div className="ml-auto relative group">
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-100">
            <Avatar name="Admin" />
            <span className="hidden text-sm md:inline">Conta</span>
          </button>
          <div className="absolute right-0 mt-2 hidden w-44 overflow-hidden rounded-md border bg-white shadow-lg group-hover:block">
            <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50">
              <User size={16} /> Meu perfil
            </Link>
            <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50">
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
