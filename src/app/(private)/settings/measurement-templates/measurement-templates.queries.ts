"use server";

import { extractItems, getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeMeasurementTemplate } from "./measurement-templates.normalizers";
import type {
  ApiMeasurementTemplate,
  MeasurementTemplate,
} from "./measurement-templates.types";

export async function listMeasurementTemplates(): Promise<MeasurementTemplate[]> {
  const companyId = await getCompanyId();
  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/measurement-templates?activeOnly=false`,
  );

  return extractItems<ApiMeasurementTemplate>(data)
    .map(normalizeMeasurementTemplate)
    .sort((first, second) => {
      if (first.isActive !== second.isActive) return first.isActive ? -1 : 1;
      return first.name.localeCompare(second.name, "pt-BR");
    });
}
