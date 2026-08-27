"use client";

import * as React from "react";
import { UserRound } from "lucide-react";

import MyAccountDialog, { type SessionUser } from "@/components/account/MyAccountDialog";
import { getClientRole, isSuperAdminRole, SESSION_KEYS } from "@/lib/mappa/session";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
};

function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEYS.user);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export default function UserAccountButton() {
  const [visible, setVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    const role = getClientRole();
    const isSuperAdmin = isSuperAdminRole(role);

    setVisible(!isSuperAdmin);

    if (isSuperAdmin) {
      return;
    }

    const user = readStoredUser();

    setUserName(user?.name || user?.email || "Minha conta");

    function handleUserUpdated(event: Event) {
      const customEvent = event as CustomEvent<SessionUser>;
      const updatedUser = customEvent.detail;

      if (updatedUser?.name) {
        setUserName(updatedUser.name);
        return;
      }

      const storedUser = readStoredUser();

      setUserName(storedUser?.name || storedUser?.email || "Minha conta");
    }

    window.addEventListener("mappa:user-updated", handleUserUpdated);

    return () => {
      window.removeEventListener("mappa:user-updated", handleUserUpdated);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="ml-auto inline-flex h-9 max-w-[280px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700" title="Minha conta">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
          <UserRound className="h-3.5 w-3.5" />
        </span>

        <span className="hidden max-w-[150px] truncate sm:inline">{userName}</span>
        <span className="sm:hidden">Conta</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.13)]" />
          Ativo
        </span>
      </button>

      <MyAccountDialog
        open={open}
        onOpenChange={setOpen}
        onUserUpdated={(user) => {
          setUserName(user.name);
        }}
      />
    </>
  );
}
