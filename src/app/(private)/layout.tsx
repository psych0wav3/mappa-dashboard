// src/app/(private)/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import Shell from "@/components/shell/Shell";

export const metadata = {
  title: "Aqua Mappa — Dashboard",
  description: "Gestão de rotas e visitas",
};

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  // 👇 importante: o seu helper já é async, por isso o await
  const supabase = await createClientServer();

  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    // sem redirectTo, só manda pro login
    redirect("/login");
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <Shell>{children}</Shell>
    </div>
  );
}
