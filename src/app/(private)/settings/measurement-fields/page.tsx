import type { Metadata } from "next";

import { listMeasurementTemplates } from "../measurement-templates/actions";
import { listMeasurementFields } from "./actions";
import MeasurementFieldsClient from "./MeasurementFieldsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Campos de Medição — Aqua Mappa",
};

export default async function MeasurementFieldsPage() {
  const [fields, templates] = await Promise.all([
    listMeasurementFields(),
    listMeasurementTemplates(),
  ]);

  return (
    <MeasurementFieldsClient
      initialFields={fields}
      templates={templates}
    />
  );
}
