// src/app/(private)/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import Shell from "@/components/shell/Shell";

export const metadata = {
  title: "Aqqua — Dashboard",
  description: "Gestão de rotas e visitas",
};

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) redirect("/login");

  // ⬇️ O Shell precisa estar AQUI
  return (
    <div className="bg-neutral-50 min-h-screen">
      <Shell>{children}</Shell>
    </div>
  );
}
