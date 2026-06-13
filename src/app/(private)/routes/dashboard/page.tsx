import type { Metadata } from "next";
import RouteDashboard from "@/components/routes/RouteDashboard";
import { listRouteTechnicians, listRoutesForDashboard } from "../actions";

export const metadata: Metadata = {
  title: "Controle das rotas — Aqua Mappa",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function RouteDashboardPage() {
  const [routes, technicians] = await Promise.all([
    listRoutesForDashboard(),
    listRouteTechnicians(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
          <h1 className="text-lg font-semibold">Controle das rotas</h1>
        </div>

        <RouteDashboard initialRoutes={routes} technicians={technicians} />
      </div>
    </div>
  );
}