"use server";

import { revalidatePath } from "next/cache";
import { extractItems, getCompanyId, mappaFetch } from "@/lib/mappa/api";

export type ChecklistItemType = "BOOLEAN" | "TEXT" | "NUMBER";

export type ChecklistTemplateItem = {
  id?: string;
  label: string;
  itemType: ChecklistItemType;
  isRequired: boolean;
  displayOrder: number;
  isActive?: boolean;
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  items: ChecklistTemplateItem[];
};

type ApiChecklistTemplateItem = {
  id?: string | null;
  label?: string | null;
  itemType?: ChecklistItemType | string | null;
  isRequired?: boolean | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
};

type ApiChecklistTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  items?: ApiChecklistTemplateItem[] | null;
};

export type SaveChecklistTemplateInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  items: ChecklistTemplateItem[];
};

function normalizeItem(
  item: ApiChecklistTemplateItem,
  index: number,
): ChecklistTemplateItem {
  return {
    id: item.id || undefined,
    label: item.label || "Item sem nome",
    itemType:
      item.itemType === "TEXT" || item.itemType === "NUMBER"
        ? item.itemType
        : "BOOLEAN",
    isRequired: item.isRequired !== false,
    displayOrder: item.displayOrder ?? index + 1,
    isActive: item.isActive !== false,
  };
}

function normalizeTemplate(template: ApiChecklistTemplate): ChecklistTemplate {
  const items = Array.isArray(template.items)
    ? template.items
        .map(normalizeItem)
        .filter((item) => item.isActive !== false)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return {
    id: template.id,
    name: template.name || "Checklist sem nome",
    description: template.description ?? null,
    isActive: template.isActive !== false,
    createdAt: template.createdAt ?? null,
    items,
  };
}

function cleanItems(items: ChecklistTemplateItem[]) {
  return items
    .map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      label: item.label.trim(),
      itemType: item.itemType,
      isRequired: Boolean(item.isRequired),
      displayOrder: index + 1,
      isActive: item.isActive !== false,
    }))
    .filter((item) => item.label.length > 0);
}

function validateChecklistInput(input: SaveChecklistTemplateInput) {
  const name = input.name.trim();
  const items = cleanItems(input.items);

  if (!name) {
    throw new Error("Informe o nome do checklist.");
  }

  if (items.length === 0) {
    throw new Error("Adicione pelo menos um item ao checklist.");
  }

  return {
    name,
    description: input.description?.trim() || null,
    isActive: input.isActive !== false,
    items,
  };
}

export async function listChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/checklist-templates?activeOnly=false`,
  );

  return extractItems<ApiChecklistTemplate>(data)
    .map(normalizeTemplate)
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

      return a.name.localeCompare(b.name, "pt-BR");
    });
}

export async function createChecklistTemplate(
  input: SaveChecklistTemplateInput,
) {
  const companyId = await getCompanyId();
  const payload = validateChecklistInput(input);

  const created = await mappaFetch<ApiChecklistTemplate>(
    `/api/companies/${companyId}/checklist-templates`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/settings/checklist-templates");
  revalidatePath("/workorders/new");

  return normalizeTemplate(created);
}

export async function updateChecklistTemplate(params: {
  templateId: string;
  input: SaveChecklistTemplateInput;
}) {
  const companyId = await getCompanyId();

  if (!params.templateId) {
    throw new Error("ID do checklist não informado.");
  }

  const payload = validateChecklistInput(params.input);

  const updated = await mappaFetch<ApiChecklistTemplate>(
    `/api/companies/${companyId}/checklist-templates/${params.templateId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/settings/checklist-templates");
  revalidatePath("/workorders/new");

  return normalizeTemplate(updated);
}

export async function updateChecklistTemplateStatus(params: {
  templateId: string;
  isActive: boolean;
}) {
  const companyId = await getCompanyId();

  if (!params.templateId) {
    throw new Error("ID do checklist não informado.");
  }

  const updated = await mappaFetch<ApiChecklistTemplate>(
    `/api/companies/${companyId}/checklist-templates/${params.templateId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive: params.isActive,
      }),
    },
  );

  revalidatePath("/settings/checklist-templates");
  revalidatePath("/workorders/new");

  return normalizeTemplate(updated);
}

export async function deleteChecklistTemplate(templateId: string) {
  const companyId = await getCompanyId();

  if (!templateId) {
    throw new Error("ID do checklist não informado.");
  }

  await mappaFetch<null>(
    `/api/companies/${companyId}/checklist-templates/${templateId}`,
    {
      method: "DELETE",
    },
  );

  revalidatePath("/settings/checklist-templates");
  revalidatePath("/workorders/new");

  return {
    ok: true,
  };
}