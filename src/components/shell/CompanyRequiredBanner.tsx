"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import {
  getClientRole,
  isSuperAdminRole,
  SESSION_KEYS,
} from "@/lib/mappa/session";

export default function CompanyRequiredBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const role = getClientRole();
    const companyId = localStorage.getItem(
      SESSION_KEYS.companyId,
    );
    const needsCompany =
      searchParams.get("needCompany") === "1";

    setShow(
      isSuperAdminRole(role) &&
        (!companyId || needsCompany),
    );
  }, [searchParams]);

  if (!show) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Selecione uma empresa no topo para operar no
      dashboard. Como Super Admin você pode alternar entre
      todas as empresas da plataforma.
    </div>
  );
}
