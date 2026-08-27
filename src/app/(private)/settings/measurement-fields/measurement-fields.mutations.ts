"use server";

import { revalidatePath } from "next/cache";
import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeMeasurementField } from "./measurement-fields.normalizers";
import type {
  ApiMeasurementField,
  MeasurementField,
  SaveMeasurementFieldInput,
} from "./measurement-fields.types";
import {
  toMeasurementFieldUpdatePayload,
  validateMeasurementFieldInput,
} from "./measurement-fields.validation";

function revalidateMeasurementFieldPaths() {
  revalidatePath("/settings/measurement-fields");
  revalidatePath("/settings/measurement-templates");
  revalidatePath("/workorders/new");
}

export async function createMeasurementField(
  input: SaveMeasurementFieldInput,
): Promise<MeasurementField> {
  const companyId = await getCompanyId();
  const created = await mappaFetch<ApiMeasurementField>(
    `/api/companies/${companyId}/measurement-fields`,
    {
      method: "POST",
      body: JSON.stringify(validateMeasurementFieldInput(input)),
    },
  );

  revalidateMeasurementFieldPaths();
  return normalizeMeasurementField(created);
}

export async function updateMeasurementField(params: {
  fieldId: string;
  input: SaveMeasurementFieldInput;
}): Promise<MeasurementField> {
  if (!params.fieldId) throw new Error("ID do campo de medição não informado.");

  const companyId = await getCompanyId();
  const updated = await mappaFetch<ApiMeasurementField>(
    `/api/companies/${companyId}/measurement-fields/${params.fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify(toMeasurementFieldUpdatePayload(params.input)),
    },
  );

  revalidateMeasurementFieldPaths();
  return normalizeMeasurementField(updated);
}

export async function updateMeasurementFieldStatus(params: {
  fieldId: string;
  isActive: boolean;
}): Promise<MeasurementField> {
  if (!params.fieldId) throw new Error("ID do campo de medição não informado.");

  const companyId = await getCompanyId();
  const updated = await mappaFetch<ApiMeasurementField>(
    `/api/companies/${companyId}/measurement-fields/${params.fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive: params.isActive }),
    },
  );

  revalidateMeasurementFieldPaths();
  return normalizeMeasurementField(updated);
}
