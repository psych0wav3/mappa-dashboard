"use server";

import { extractItems, getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeChecklistTemplate } from "./checklist-templates.normalizers";
import type {
  ApiChecklistTemplate,
  ChecklistTemplate,
} from "./checklist-templates.types";

export async function listChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const companyId = await getCompanyId();
  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/checklist-templates?activeOnly=false`,
  );

  return extractItems<ApiChecklistTemplate>(data)
    .map(normalizeChecklistTemplate)
    .sort((first, second) => {
      if (first.isActive !== second.isActive) return first.isActive ? -1 : 1;
      return first.name.localeCompare(second.name, "pt-BR");
    });
}
