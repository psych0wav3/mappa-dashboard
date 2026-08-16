import type {
  Metadata,
} from "next";

import {
  listRouteTechnicians,
} from "@/app/(private)/routes/actions";

import {
  listWeeklyRoutePlanningServices,
  listWeeklyRouteTemplates,
} from "@/app/(private)/routes/weekly-route.actions";

import RouteBuilder from "@/components/routes/RouteBuilder";

export const dynamic =
  "force-dynamic";

export const fetchCache =
  "force-no-store";

export const metadata: Metadata = {
  title:
    "Planejamento de rotas — Aqua Mappa",
};

export default async function RouteBuilderPage() {
  const [
    technicians,
    services,
    templates,
  ] = await Promise.all([
    listRouteTechnicians(),

    listWeeklyRoutePlanningServices(),

    listWeeklyRouteTemplates(),
  ]);

  return <RouteBuilder technicians={technicians} services={services} initialTemplates={templates} />;
}