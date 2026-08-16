import type { Metadata } from "next";

import MeasurementTemplatesClient from "./MeasurementTemplatesClient";
import { listMeasurementTemplates } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Templates de Medição — Aqua Mappa",
};

export default async function MeasurementTemplatesPage() {
  const templates =
    await listMeasurementTemplates();

  return <MeasurementTemplatesClient initialTemplates={templates} />;
}