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

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <RouteBuilder
        technicians={
          technicians
        }
        services={
          services
        }
        initialTemplates={
          templates
        }
      />
    </div>
  );
}