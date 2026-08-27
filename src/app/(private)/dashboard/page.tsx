import type {
  Metadata,
} from "next";

import Link from "next/link";

import type {
  LucideIcon,
} from "lucide-react";

import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Route,
  UserRound,
  UsersRound,
} from "lucide-react";

import OneTimeOrdersReminder from "@/components/dashboard/OneTimeOrdersReminder";
import PartialLoadAlert from "@/components/feedback/PartialLoadAlert";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import {
  getFailedResources,
  safeLoad,
} from "@/lib/mappa/safe-load";

import {
  createEmptyDashboardOneTimeOrderReminder,
  getDashboardMetrics,
  getDashboardOneTimeOrderReminder,
} from "./actions";

export const metadata: Metadata = {
  title:
    "Painel de controle — Aqua Mappa",
};

export const dynamic =
  "force-dynamic";

export const fetchCache =
  "force-no-store";

type MetricCardProps = {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: LucideIcon;

  tone?:
    | "sky"
    | "emerald"
    | "amber"
    | "violet"
    | "slate";

  detail?: string;
};

const tones = {
  sky:
    "bg-sky-50 text-sky-600",

  emerald:
    "bg-emerald-50 text-emerald-600",

  amber:
    "bg-amber-50 text-amber-600",

  violet:
    "bg-violet-50 text-violet-600",

  slate:
    "bg-slate-100 text-slate-600",
} as const;

function MetricCard({
  label,
  value,
  description,
  href,
  icon: Icon,
  tone = "sky",
  detail,
}: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md sm:min-h-[150px] sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-sky-500" />
      </div>

      <div className="mt-4 min-w-0 sm:mt-5">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {label}
        </p>

        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
          {description}
        </p>

        {detail ? (
          <p className="mt-2 inline-flex max-w-full break-words rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold leading-4 text-sky-700">
            {detail}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [
    metrics,
    oneTimeOrders,
  ] = await Promise.all([
    /*
     * Dado principal.
     *
     * Se falhar:
     * → error.tsx
     */
    getDashboardMetrics(),

    /*
     * O lembrete é um complemento do
     * Dashboard.
     *
     * Se houver timeout / 5xx / rede,
     * conseguimos manter as métricas
     * visíveis e informar a falha.
     */
    safeLoad({
      resource:
        "OS avulsas para organizar",

      loader:
        getDashboardOneTimeOrderReminder,

      fallback:
        createEmptyDashboardOneTimeOrderReminder(),
    }),
  ]);

  const failedResources =
    getFailedResources([
      oneTimeOrders,
    ]);

  const oneTimeDetail =
    oneTimeOrders.data
      .totalAvailableCount >
    0
      ? oneTimeOrders.data
          .totalAvailableCount ===
        1
        ? "1 é OS avulsa com data definida"
        : `${oneTimeOrders.data.totalAvailableCount} são OS avulsas com data definida`
      : undefined;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <FormPageHeader
        icon={ClipboardCheck}
        title="Painel de controle"
        description="Acompanhe os principais números e o andamento da operação da empresa."
      />

      <PartialLoadAlert
        resources={
          failedResources
        }
      />

      <OneTimeOrdersReminder
        data={
          oneTimeOrders.data
        }
      />

      <section className="min-w-0">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Visão geral
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Cadastros e movimentação de hoje.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Clientes"
            value={
              metrics.totalCustomers
            }
            description="Clientes cadastrados na empresa."
            href="/clients"
            icon={
              UserRound
            }
            tone="sky"
          />

          <MetricCard
            label="Técnicos"
            value={
              metrics.totalEmployees
            }
            description="Profissionais cadastrados na operação."
            href="/technicians"
            icon={
              UsersRound
            }
            tone="violet"
          />

          <MetricCard
            label="Rotas planejadas hoje"
            value={
              metrics.plannedRoutesToday
            }
            description="Rotas organizadas para execução hoje."
            href="/routes/dashboard"
            icon={
              Route
            }
            tone="amber"
          />

          <MetricCard
            label="Concluídos hoje"
            value={
              metrics.doneOrdersToday
            }
            description="Atendimentos finalizados no dia."
            href="/workorders"
            icon={
              CheckCircle2
            }
            tone="emerald"
          />
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Ordens de serviço
            </h2>

            <p className="mt-1 break-words text-xs leading-5 text-slate-500">
              Veja rapidamente em qual etapa estão as ordens que ainda exigem acompanhamento.
            </p>
          </div>

          <Link
            href="/workorders"
            className="inline-flex shrink-0 items-center gap-1 self-start text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Ver todas

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Aguardando precificação"
            value={
              metrics.pendingCompanyPricingOrders
            }
            description="OS que ainda precisam receber os valores da empresa."
            href="/workorders/pricing"
            icon={
              CircleDollarSign
            }
            tone="amber"
          />

          <MetricCard
            label="Aguardando aprovação"
            value={
              metrics.pendingCustomerApprovalOrders
            }
            description="OS enviadas e ainda não aprovadas pelo cliente."
            href="/workorders/customer-approval"
            icon={
              Clock3
            }
            tone="violet"
          />

          <MetricCard
            label="Aguardando execução"
            value={
              metrics.waitingExecutionOrders
            }
            description="OS aprovadas e prontas para entrar na operação."
            href="/routes/builder"
            icon={
              CalendarCheck2
            }
            tone="sky"
            detail={
              oneTimeDetail
            }
          />

          <MetricCard
            label="Em rota"
            value={
              metrics.inRouteOrders
            }
            description="Atendimentos que já estão incluídos em uma rota."
            href="/routes/dashboard"
            icon={
              Route
            }
            tone="emerald"
          />
        </div>
      </section>
    </div>
  );
}