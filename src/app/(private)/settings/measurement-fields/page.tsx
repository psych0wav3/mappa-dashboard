import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Templates de Medição — Aqua Mappa",
};

export default function MeasurementFieldsPage() {
  redirect("/settings/measurement-templates");
}