import type {
  Metadata,
} from "next";

import {
  listRouteTechnicians,
  listRoutesForDashboard,
} from "@/app/(private)/routes/actions";

import PartialLoadAlert from "@/components/feedback/PartialLoadAlert";
import RouteDashboard from "@/components/routes/RouteDashboard";

import {
  getFailedResources,
  safeLoad,
} from "@/lib/mappa/safe-load";

export const metadata: Metadata = {
  title:
    "Controle das rotas — Aqua Mappa",
};

export const dynamic =
  "force-dynamic";

export const fetchCache =
  "force-no-store";

export default async function RouteDashboardPage() {
  const [
    routes,
    technicians,
  ] = await Promise.all([
    /*
     * Dado principal.
     *
     * Se falhar:
     * → (private)/error.tsx
     */
    listRoutesForDashboard(),

    /*
     * Dado auxiliar.
     *
     * Se houver erro recuperável,
     * a página ainda consegue mostrar
     * as rotas já carregadas.
     */
    safeLoad({
      resource:
        "técnicos",

      loader:
        listRouteTechnicians,

      fallback:
        [],
    }),
  ]);

  const failedResources =
    getFailedResources([
      technicians,
    ]);

  return (
    <>
      <PartialLoadAlert
        resources={
          failedResources
        }
      />

      <RouteDashboard
        initialRoutes={
          routes
        }
        technicians={
          technicians.data
        }
      />
    </>
  );
}