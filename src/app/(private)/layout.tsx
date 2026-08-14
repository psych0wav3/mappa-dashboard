import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Shell from "@/components/shell/Shell";
import PendingAgreementsGate from "@/components/agreements/PendingAgreementsGate";

export const metadata = {
  title: "Aqua Mappa — Dashboard",
  description: "Gestão de rotas e visitas",
};

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mappa_access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <Shell>
        <PendingAgreementsGate>{children}</PendingAgreementsGate>
      </Shell>
    </div>
  );
}
