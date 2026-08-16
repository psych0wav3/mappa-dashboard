import type { Metadata } from "next";

import FormPage from "@/components/form-layout/FormPage";
import ServicePlansClient from "@/components/service-plans/ServicePlansClient";

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
  const [plans, customers, technicians, checklistTemplates, measurementTemplates] = await Promise.all([
    listServicePlans(),
    listWorkOrderCustomers(),
    listWorkOrderTechnicians(),
    listWorkOrderChecklistTemplates(),
    listWorkOrderMeasurementTemplates(),
  ]);

  return (
    <FormPage>
      <ServicePlansClient initialPlans={plans} customers={customers} technicians={technicians} checklistTemplates={checklistTemplates} measurementTemplates={measurementTemplates} />
    </FormPage>
  );
}