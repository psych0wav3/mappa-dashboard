"use client";

import { Menu } from "lucide-react";

import CompanySwitcher from "./CompanySwitcher";
import UserAccountButton from "./UserAccountButton";

export default function AppTopbar({
  onOpenMenu,
}: {
  onOpenMenu: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-[90] h-[64px] border-b bg-white/90 backdrop-blur transition-[left] duration-300 xl:left-[var(--sidebar-w)]">
      <div className="mx-auto flex h-full w-full max-w-[1400px] min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-5 xl:px-6">
        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-700 transition hover:bg-neutral-100 xl:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <CompanySwitcher />
          <UserAccountButton />
        </div>
      </div>
    </header>
  );
}
