import type { Metadata } from "next";

import {
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
  const [routes, technicians] = await Promise.all([
    listRoutesForDashboard(),
    listRouteTechnicians(),
  ]);

  return <RouteDashboard initialRoutes={routes} technicians={technicians} />;
}