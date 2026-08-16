import type { Metadata } from "next";

import {
  listOneTimeServiceOrdersForRoute,
  listRouteTechnicians,
  listRoutesForDashboard,
} from "@/app/(private)/routes/actions";

import RouteDashboard from "@/components/routes/RouteDashboard";

export const metadata: Metadata = {
  title: "Controle das rotas — Aqua Mappa",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function RouteDashboardPage() {
  const [routes, technicians, oneTimeOrders] = await Promise.all([
    listRoutesForDashboard(),
    listRouteTechnicians(),
    listOneTimeServiceOrdersForRoute(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RouteDashboard initialRoutes={routes} technicians={technicians} initialOneTimeOrders={oneTimeOrders} />
      </div>
    </div>
  );
}