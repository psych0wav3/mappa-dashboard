import type { Metadata } from "next";
import ChecklistTemplatesClient from "./ChecklistTemplatesClient";
import { listChecklistTemplates } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Checklists de Serviço — Aqua Mappa",
};

export default async function ChecklistTemplatesPage() {
  const templates = await listChecklistTemplates();

  return <ChecklistTemplatesClient initialTemplates={templates} />;
}