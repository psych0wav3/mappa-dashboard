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

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <ChecklistTemplatesClient initialTemplates={templates} />
    </div>
  );
}