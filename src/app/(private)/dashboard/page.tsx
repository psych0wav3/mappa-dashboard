// src/app/(private)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard — Aqua Mappa",
};

function formatPlanLabel(plan?: string | null) {
  if (!plan) return "Starter";
  const key = plan.toLowerCase();
  const map: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  };
  return map[key] ?? plan;
}

function formatPlanStatus(status?: string | null) {
  if (!status) return "ativo";
  const key = status.toLowerCase();
  if (key === "active") return "ativo";
  if (key === "trialing") return "em avaliação";
  if (key === "canceled" || key === "cancelled") return "cancelado";
  if (key === "past_due") return "em atraso";
  return status;
}

export default async function DashboardPage() {
  const supabase = await createClientServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  // Metadata que vem do Auth (Stripe / cadastro)
  const meta = (user.user_metadata || {}) as {
    fullName?: string;
    plan?: string;
    planStatus?: string;
    companyName?: string;
  };

  // Company do multi-tenant
  const companyUser = await (prisma as any).companyUser.findFirst({
    where: { userId: user.id },
    include: { company: true },
  });

  const company = companyUser?.company ?? null;

  const planFromCompany = company?.plan;
  const statusFromCompany = company?.planStatus;

  const plan = planFromCompany ?? meta.plan ?? "starter";
  const planStatus = statusFromCompany ?? meta.planStatus ?? "active";

  const planLabel = formatPlanLabel(plan);
  const statusLabel = formatPlanStatus(planStatus);

  const companyName =
    company?.name || meta.companyName || meta.fullName || user.email;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Olá, {meta.fullName || user.email}
          </h1>
          <p className="text-sm text-slate-600">{companyName}</p>
        </div>

        {/* Badge de plano / status */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-900">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.4)]" />
          <span>
            Plano{" "}
            <span className="font-semibold">{planLabel}</span> — {statusLabel}
          </span>
        </div>
      </header>

      {/* Conteúdo principal do dashboard */}
      <main className="space-y-6">
        {/* 👉 Aqui você pode manter/colar seus cards e métricas atuais */}
        {/* Exemplo de grid vazia só para não quebrar o layout: */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Seus cards de resumo, gráficos, etc */}
        </section>

        {/* Outra seção opcional */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Próximos passos
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Use o atalho{" "}
            <span className="font-semibold">Início rápido</span> no menu para
            continuar o onboarding ou acesse diretamente as rotas, técnicos e
            clientes.
          </p>
        </section>
      </main>
    </div>
  );
}
