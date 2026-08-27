"use server";

import { revalidatePath } from "next/cache";
import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeMeasurementTemplate } from "./measurement-templates.normalizers";
import type {
  ApiMeasurementTemplate,
  MeasurementTemplate,
  SaveMeasurementTemplateInput,
} from "./measurement-templates.types";
import { validateMeasurementTemplateInput } from "./measurement-templates.validation";

function revalidateMeasurementTemplatePaths(includeWorkOrders = false) {
  revalidatePath("/settings/measurement-templates");
  revalidatePath("/settings/measurement-fields");
  if (includeWorkOrders) revalidatePath("/workorders/new");
}

export async function createMeasurementTemplate(
  input: SaveMeasurementTemplateInput,
): Promise<MeasurementTemplate> {
  const companyId = await getCompanyId();
  const created = await mappaFetch<ApiMeasurementTemplate>(
    `/api/companies/${companyId}/measurement-templates`,
    { method: "POST", body: JSON.stringify(validateMeasurementTemplateInput(input)) },
  );
  revalidateMeasurementTemplatePaths();
  return normalizeMeasurementTemplate(created);
}

export async function updateMeasurementTemplate(params: {
  templateId: string;
  input: SaveMeasurementTemplateInput;
}): Promise<MeasurementTemplate> {
  if (!params.templateId) throw new Error("ID do template de medição não informado.");
  const companyId = await getCompanyId();
  const updated = await mappaFetch<ApiMeasurementTemplate>(
    `/api/companies/${companyId}/measurement-templates/${params.templateId}`,
    { method: "PATCH", body: JSON.stringify(validateMeasurementTemplateInput(params.input)) },
  );
  revalidateMeasurementTemplatePaths();
  return normalizeMeasurementTemplate(updated);
}

export async function updateMeasurementTemplateStatus(params: {
  templateId: string;
  isActive: boolean;
}): Promise<MeasurementTemplate> {
  if (!params.templateId) throw new Error("ID do template de medição não informado.");
  const companyId = await getCompanyId();
  const updated = await mappaFetch<ApiMeasurementTemplate>(
    `/api/companies/${companyId}/measurement-templates/${params.templateId}`,
    { method: "PATCH", body: JSON.stringify({ isActive: params.isActive }) },
  );
  revalidateMeasurementTemplatePaths(true);
  return normalizeMeasurementTemplate(updated);
}

export async function deleteMeasurementTemplate(templateId: string) {
  if (!templateId) throw new Error("ID do template de medição não informado.");
  const companyId = await getCompanyId();
  await mappaFetch<null>(
    `/api/companies/${companyId}/measurement-templates/${templateId}`,
    { method: "DELETE" },
  );
  revalidateMeasurementTemplatePaths(true);
  return { ok: true };
}
