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
    <header
      className="fixed right-0 top-0 z-[90] h-[64px] border-b bg-white/80 backdrop-blur"
      style={{ left: "var(--sidebar-w)" }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-3 lg:px-6">
        <button
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-neutral-100 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CompanySwitcher />
          <UserAccountButton />
        </div>
      </div>
    </header>
  );
}