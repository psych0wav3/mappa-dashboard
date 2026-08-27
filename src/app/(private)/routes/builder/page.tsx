import type { Metadata } from "next";

import {
  listRouteTechnicians,
} from "@/app/(private)/routes/actions";

import {
  listWeeklyRoutePlanningServices,
  listWeeklyRouteTemplates,
} from "@/app/(private)/routes/weekly-route.actions";

import RouteBuilder from "@/components/routes/RouteBuilder";

export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title:
    "Planejamento de rotas — Aqua Mappa",
};

export default async function RouteBuilderPage() {
  /*
   * Os três conjuntos de dados são essenciais
   * para o planejamento semanal.
   *
   * Não usamos safeLoad() aqui porque um
   * fallback [] poderia fazer a interface
   * representar incorretamente:
   *
   * - que não existem técnicos;
   * - que não existem rotinas;
   * - ou que não existe planejamento salvo.
   *
   * Se qualquer chamada falhar, o erro deve
   * subir para:
   *
   * src/app/(private)/error.tsx
   */
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
    <RouteBuilder
      technicians={technicians}
      services={services}
      initialTemplates={templates}
    />
  );
}