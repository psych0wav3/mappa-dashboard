import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Map,
  Route,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import {
  emptyDashboardMetrics,
  getDashboardMetrics,
  type DashboardMetrics,
} from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type DashboardCard = {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
  href: string;
};

async function loadMetrics() {
  try {
    const metrics = await getDashboardMetrics();

    return {
      metrics,
      error: null,
    };
  } catch (error) {
    return {
      metrics: emptyDashboardMetrics,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o painel.",
    };
  }
}

function buildCards(metrics: DashboardMetrics): DashboardCard[] {
  return [
    {
      title: "Clientes",
      value: metrics.totalCustomers,
      description: "Clientes cadastrados",
      icon: Users,
      href: "/clients",
    },
    {
      title: "Técnicos",
      value: metrics.totalEmployees,
      description: "Funcionários cadastrados",
      icon: UserRound,
      href: "/technicians",
    },
    {
      title: "Aguardando precificação",
      value: metrics.pendingCompanyPricingOrders,
      description: "OS criadas pelo funcionário",
      icon: WalletCards,
      href: "/workorders",
    },
    {
      title: "Aguardando aprovação",
      value: metrics.pendingCustomerApprovalOrders,
      description: "Pendentes do cliente",
      icon: Clock,
      href: "/workorders",
    },
    {
      title: "Aguardando execução",
      value: metrics.waitingExecutionOrders,
      description: "Prontas para entrar em rota",
      icon: ClipboardList,
      href: "/workorders",
    },
    {
      title: "Em rota",
      value: metrics.inRouteOrders,
      description: "Ordens já atribuídas",
      icon: Route,
      href: "/routes",
    },
    {
      title: "Finalizadas hoje",
      value: metrics.doneOrdersToday,
      description: "Serviços concluídos hoje",
      icon: CheckCircle2,
      href: "/workorders",
    },
    {
      title: "Rotas planejadas hoje",
      value: metrics.plannedRoutesToday,
      description: "Rotas previstas para hoje",
      icon: Map,
      href: "/routes",
    },
  ];
}

export default async function DashboardPage() {
  const { metrics, error } = await loadMetrics();
  const cards = buildCards(metrics);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Olá, admin@piscinasazul.com
          </h1>
          <p className="text-sm text-slate-500">Piscinas Azul</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          API conectada
        </div>
      </header>

      {error && (
        <section className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          <h2 className="mb-1 font-semibold">Erro ao carregar painel</h2>
          <p>{error}</p>
        </section>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="text-2xl font-semibold text-slate-900">
                  {card.value}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {card.description}
              </p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}