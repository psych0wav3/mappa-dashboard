import type { Metadata } from "next";

import FormPage from "@/components/form-layout/FormPage";
import PartialLoadAlert from "@/components/feedback/PartialLoadAlert";
import ServicePlansClient from "@/components/service-plans/ServicePlansClient";

import {
  getFailedResources,
  safeLoad,
} from "@/lib/mappa/safe-load";

import { listServicePlans } from "./actions";

import {
  listWorkOrderChecklistTemplates,
  listWorkOrderCustomers,
  listWorkOrderMeasurementTemplates,
  listWorkOrderTechnicians,
} from "../workorders/actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Rotinas de Atendimento — Aqua Mappa",
};

export default async function ServicePlansPage() {
  const [
    plans,
    customers,
    technicians,
    checklistTemplates,
    measurementTemplates,
  ] = await Promise.all([
    /*
     * Dado principal da página.
     * Se falhar, sobe para o error.tsx.
     */
    listServicePlans(),

    safeLoad({
      resource: "clientes",
      loader: listWorkOrderCustomers,
      fallback: [],
    }),

    safeLoad({
      resource: "técnicos",
      loader: listWorkOrderTechnicians,
      fallback: [],
    }),

    safeLoad({
      resource: "checklists",
      loader: listWorkOrderChecklistTemplates,
      fallback: [],
    }),

    safeLoad({
      resource: "medições",
      loader: listWorkOrderMeasurementTemplates,
      fallback: [],
    }),
  ]);

  const failedResources = getFailedResources([
    customers,
    technicians,
    checklistTemplates,
    measurementTemplates,
  ]);

  return (
    <FormPage>
      <PartialLoadAlert resources={failedResources} />

      <ServicePlansClient
        initialPlans={plans}
        customers={customers.data}
        technicians={technicians.data}
        checklistTemplates={checklistTemplates.data}
        measurementTemplates={measurementTemplates.data}
      />
    </FormPage>
  );
}