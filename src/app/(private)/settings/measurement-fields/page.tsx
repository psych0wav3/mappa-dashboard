import type { Metadata } from "next";
import MeasurementFieldsClient from "./MeasurementFieldsClient";
import { listMeasurementFields } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Campos de Medição — Aqua Mappa",
};

export default async function MeasurementFieldsPage() {
  const fields = await listMeasurementFields();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <MeasurementFieldsClient initialFields={fields} />
    </div>
  );
}