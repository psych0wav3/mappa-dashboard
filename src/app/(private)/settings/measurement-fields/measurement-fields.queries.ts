"use server";

import { extractItems, getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeMeasurementField } from "./measurement-fields.normalizers";
import type {
  ApiMeasurementField,
  MeasurementField,
} from "./measurement-fields.types";

export async function listMeasurementFields(): Promise<MeasurementField[]> {
  const companyId = await getCompanyId();
  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/measurement-fields?activeOnly=false`,
  );

  return extractItems<ApiMeasurementField>(data)
    .map(normalizeMeasurementField)
    .sort((first, second) => {
      if (first.isActive !== second.isActive) return first.isActive ? -1 : 1;
      if (first.displayOrder !== second.displayOrder) {
        return first.displayOrder - second.displayOrder;
      }
      return first.label.localeCompare(second.label, "pt-BR");
    });
}
