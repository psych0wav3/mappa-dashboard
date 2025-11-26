// src/app/(private)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function getPlanLabel(plan?: string | null) {
  const key = (plan || "starter").toLowerCase();
  switch (key) {
    case "pro":
      return "Plano Pro";
    case "business":
      return "Plano Business";
    case "enterprise":
      return "Plano Enterprise";
    default:
      return "Plano Starter";
  }
}

export default async function DashboardPage() {
  const supabase = await createClientServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  // 🔹 empresa atual (via CompanyUser)
  const companyUser = await prisma.companyUser.findFirst({
    where: { userId: user.id },
    include: { company: true },
  });

  const company = companyUser?.company ?? null;

  const plan = company?.plan ?? (user.user_metadata as any)?.plan ?? "starter";
  const planStatus =
    company?.planStatus ?? (user.user_metadata as any)?.planStatus ?? "active";

  const planLabel = getPlanLabel(plan);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Olá, {user.email}
          </h1>
          <p className="text-sm text-slate-500">
            {company?.name ?? "Bem-vindo ao Aqua Mappa."}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {planLabel} — {planStatus === "active" ? "ativo" : planStatus}
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">
          Próximos passos
        </h2>
        <p className="text-xs text-slate-600">
          Use o atalho{" "}
          <Link
            href="/quickstart"
            className="font-medium text-sky-700 hover:underline"
          >
            Início rápido
          </Link>{" "}
          no menu para continuar o onboarding ou acesse diretamente as rotas,
          técnicos e clientes.
        </p>
      </section>
    </main>
  );
}
