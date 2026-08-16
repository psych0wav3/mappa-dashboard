import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarCheck2, CheckCircle2, CircleDollarSign, ClipboardCheck, Clock3, Route, UserRound, UsersRound } from "lucide-react";

import { getDashboardMetrics } from "./actions";

export const metadata: Metadata = {
  title: "Painel de controle — Aqua Mappa",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type MetricCardProps = {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: LucideIcon;
  tone?: "sky" | "emerald" | "amber" | "violet" | "slate";
};

const tones = {
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
} as const;

function MetricCard({ label, value, description, href, icon: Icon, tone = "sky" }: MetricCardProps) {
  return (
    <Link href={href} className="group flex min-h-[150px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-sky-500" />
      </div>
      <div className="mt-5">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><ClipboardCheck className="h-5 w-5" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Painel de controle</h1>
            <p className="mt-0.5 text-sm text-slate-500">Acompanhe os principais números e o andamento da operação da empresa.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Visão geral</h2>
          <p className="mt-1 text-xs text-slate-500">Cadastros e movimentação de hoje.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Clientes" value={metrics.totalCustomers} description="Clientes cadastrados na empresa." href="/clients" icon={UserRound} tone="sky" />
          <MetricCard label="Técnicos" value={metrics.totalEmployees} description="Profissionais cadastrados na operação." href="/technicians" icon={UsersRound} tone="violet" />
          <MetricCard label="Rotas planejadas hoje" value={metrics.plannedRoutesToday} description="Rotas organizadas para execução hoje." href="/routes/dashboard" icon={Route} tone="amber" />
          <MetricCard label="Concluídos hoje" value={metrics.doneOrdersToday} description="Atendimentos finalizados no dia." href="/workorders" icon={CheckCircle2} tone="emerald" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Ordens de serviço</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Veja rapidamente em qual etapa estão as ordens que ainda exigem acompanhamento.</p>
          </div>
          <Link href="/workorders" className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 sm:flex">Ver todas <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Aguardando precificação" value={metrics.pendingCompanyPricingOrders} description="OS que ainda precisam receber os valores da empresa." href="/workorders/pricing" icon={CircleDollarSign} tone="amber" />
          <MetricCard label="Aguardando aprovação" value={metrics.pendingCustomerApprovalOrders} description="OS enviadas e ainda não aprovadas pelo cliente." href="/workorders/customer-approval" icon={Clock3} tone="violet" />
          <MetricCard label="Aguardando execução" value={metrics.waitingExecutionOrders} description="OS aprovadas e prontas para entrar na operação." href="/workorders/approved" icon={CalendarCheck2} tone="sky" />
          <MetricCard label="Em rota" value={metrics.inRouteOrders} description="Atendimentos que já estão incluídos em uma rota." href="/routes/dashboard" icon={Route} tone="emerald" />
        </div>
      </section>
    </div>
  );
}