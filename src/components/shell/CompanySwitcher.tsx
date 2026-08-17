"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Building2 } from "lucide-react";

import { getClientRole, isSuperAdminRole, SESSION_KEYS } from "@/lib/mappa/session";

type StoredRole = {
  companyId?: string | null;
  companyName?: string | null;
  CompanyId?: string | null;
  CompanyName?: string | null;
};

type StoredUser = {
  roles?: StoredRole[];
  Roles?: StoredRole[];
};

function getCompanyNameFromUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEYS.user);

    if (!raw) {
      return "";
    }

    const user = JSON.parse(raw) as StoredUser;

    const role = user.roles?.[0] ?? user.Roles?.[0];

    return role?.companyName ?? role?.CompanyName ?? "";
  } catch {
    return "";
  }
}

export default function CompanySwitcher() {
  const router = useRouter();

  const [ready, setReady] = React.useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [companyName, setCompanyName] = React.useState("");

  React.useEffect(() => {
    const superAdmin = isSuperAdminRole(getClientRole());

    setIsSuperAdmin(superAdmin);

    const storedCompanyName =
      localStorage.getItem(SESSION_KEYS.companyName) ||
      getCompanyNameFromUser() ||
      "Empresa";

    setCompanyName(storedCompanyName);
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="hidden text-xs text-slate-400 sm:inline">Empresa:</span>
        <span className="truncate font-medium text-slate-700">{companyName}</span>
      </div>

      {isSuperAdmin && (
        <button type="button" onClick={() => router.push("/select-company")} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Trocar empresa</span>
          <span className="sm:hidden">Trocar</span>
        </button>
      )}
    </div>
  );
}