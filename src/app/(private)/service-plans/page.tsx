import ServicePlansClient from "./ServicePlansClient";
import { listServicePlans } from "./actions";

import {
  listWorkOrderChecklistTemplates,
  listWorkOrderCustomers,
  listWorkOrderMeasurementTemplates,
  listWorkOrderTechnicians,
} from "../workorders/actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ServicePlansPage() {
  const [
    plans,
    customers,
    technicians,
    checklistTemplates,
    measurementTemplates,
  ] = await Promise.all([
    listServicePlans(),
    listWorkOrderCustomers(),
    listWorkOrderTechnicians(),
    listWorkOrderChecklistTemplates(),
    listWorkOrderMeasurementTemplates(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <ServicePlansClient
        initialPlans={plans}
        customers={customers}
        technicians={technicians}
        checklistTemplates={checklistTemplates}
        measurementTemplates={
          measurementTemplates
        }
      />
    </div>
  );
}