import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import PendingAgreementsGate from "@/components/agreements/PendingAgreementsGate";
import Shell from "@/components/shell/Shell";
import { isSuperAdminRole, SESSION_KEYS } from "@/lib/mappa/session";

export const metadata = {
  title: "Aqua Mappa — Dashboard",
  description: "Gestão de rotas e visitas",
};

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_KEYS.token)?.value;
  const role = cookieStore.get(SESSION_KEYS.role)?.value;
  const companyId = cookieStore.get(SESSION_KEYS.companyId)?.value;

  if (!token) redirect("/login");
  if (isSuperAdminRole(role) && !companyId) redirect("/select-company");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Shell>
        <PendingAgreementsGate>{children}</PendingAgreementsGate>
      </Shell>
    </div>
  );
}