"use server";

import { revalidatePath } from "next/cache";
import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeChecklistTemplate } from "./checklist-templates.normalizers";
import type {
  ApiChecklistTemplate,
  SaveChecklistTemplateInput,
} from "./checklist-templates.types";
import { validateChecklistInput } from "./checklist-templates.validation";

function revalidateChecklistPaths() {
  revalidatePath("/settings/checklist-templates");
  revalidatePath("/workorders/new");
}

export async function createChecklistTemplate(input: SaveChecklistTemplateInput) {
  const companyId = await getCompanyId();
  const created = await mappaFetch<ApiChecklistTemplate>(
    `/api/companies/${companyId}/checklist-templates`,
    { method: "POST", body: JSON.stringify(validateChecklistInput(input)) },
  );
  revalidateChecklistPaths();
  return normalizeChecklistTemplate(created);
}

export async function updateChecklistTemplate(params: {
  templateId: string;
  input: SaveChecklistTemplateInput;
}) {
  if (!params.templateId) throw new Error("ID do checklist não informado.");
  const companyId = await getCompanyId();
  const updated = await mappaFetch<ApiChecklistTemplate>(
    `/api/companies/${companyId}/checklist-templates/${params.templateId}`,
    { method: "PATCH", body: JSON.stringify(validateChecklistInput(params.input)) },
  );
  revalidateChecklistPaths();
  return normalizeChecklistTemplate(updated);
}

export async function updateChecklistTemplateStatus(params: {
  templateId: string;
  isActive: boolean;
}) {
  if (!params.templateId) throw new Error("ID do checklist não informado.");
  const companyId = await getCompanyId();
  const updated = await mappaFetch<ApiChecklistTemplate>(
    `/api/companies/${companyId}/checklist-templates/${params.templateId}`,
    { method: "PATCH", body: JSON.stringify({ isActive: params.isActive }) },
  );
  revalidateChecklistPaths();
  return normalizeChecklistTemplate(updated);
}

export async function deleteChecklistTemplate(templateId: string) {
  if (!templateId) throw new Error("ID do checklist não informado.");
  const companyId = await getCompanyId();
  await mappaFetch<null>(
    `/api/companies/${companyId}/checklist-templates/${templateId}`,
    { method: "DELETE" },
  );
  revalidateChecklistPaths();
  return { ok: true };
}
