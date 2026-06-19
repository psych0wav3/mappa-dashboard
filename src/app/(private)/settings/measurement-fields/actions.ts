"use server";

import { revalidatePath } from "next/cache";
import { extractItems, getCompanyId, mappaFetch } from "@/lib/mappa/api";

export type MeasurementFieldType = "NUMBER" | "TEXT" | "BOOLEAN";

export type MeasurementField = {
  id: string;
  fieldName: string;
  label: string;
  fieldType: MeasurementFieldType;
  unit?: string | null;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
};

type ApiMeasurementField = {
  id: string;
  fieldName?: string | null;
  name?: string | null;
  label?: string | null;
  fieldType?: MeasurementFieldType | string | null;
  valueType?: MeasurementFieldType | string | null;
  unit?: string | null;
  isRequired?: boolean | null;
  isActive?: boolean | null;
  displayOrder?: number | null;
};

export type SaveMeasurementFieldInput = {
  fieldName: string;
  label: string;
  fieldType: MeasurementFieldType;
  unit?: string;
  isRequired: boolean;
  isActive?: boolean;
  displayOrder?: number;
};

function normalizeField(
  field: ApiMeasurementField,
  index: number,
): MeasurementField {
  const rawType = field.fieldType || field.valueType || "NUMBER";

  return {
    id: field.id,
    fieldName: field.fieldName || field.name || "",
    label: field.label || field.name || field.fieldName || "Campo sem nome",
    fieldType:
      rawType === "TEXT" || rawType === "BOOLEAN" ? rawType : "NUMBER",
    unit: field.unit ?? null,
    isRequired: field.isRequired === true,
    isActive: field.isActive !== false,
    displayOrder: field.displayOrder ?? index + 1,
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function validateMeasurementFieldInput(input: SaveMeasurementFieldInput) {
  const label = input.label.trim();
  const fieldName = input.fieldName.trim() || slugify(label);
  const unit =
    input.fieldType === "NUMBER" ? input.unit?.trim() || null : null;

  if (!label) {
    throw new Error("Informe o rótulo do campo.");
  }

  if (!fieldName) {
    throw new Error("Informe o nome técnico do campo.");
  }

  return {
    // O backend está exigindo Name.
    name: label,

    // Mantemos também estes campos para compatibilidade com o front e com variações da API.
    fieldName,
    label,
    fieldType: input.fieldType,
    valueType: input.fieldType,

    unit,
    isRequired: Boolean(input.isRequired),
    isActive: input.isActive !== false,
    displayOrder: input.displayOrder || 1,
  };
}

export async function listMeasurementFields(): Promise<MeasurementField[]> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/measurement-fields?activeOnly=false`,
  );

  return extractItems<ApiMeasurementField>(data)
    .map(normalizeField)
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

      return a.displayOrder - b.displayOrder;
    });
}

export async function createMeasurementField(input: SaveMeasurementFieldInput) {
  const companyId = await getCompanyId();
  const payload = validateMeasurementFieldInput(input);

  const created = await mappaFetch<ApiMeasurementField>(
    `/api/companies/${companyId}/measurement-fields`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/settings/measurement-fields");

  return normalizeField(created, 0);
}

export async function updateMeasurementField(params: {
  fieldId: string;
  input: SaveMeasurementFieldInput;
}) {
  const companyId = await getCompanyId();

  if (!params.fieldId) {
    throw new Error("ID do campo de medição não informado.");
  }

  const payload = validateMeasurementFieldInput(params.input);

  const updated = await mappaFetch<ApiMeasurementField>(
    `/api/companies/${companyId}/measurement-fields/${params.fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/settings/measurement-fields");

  return normalizeField(updated, 0);
}

export async function updateMeasurementFieldStatus(params: {
  fieldId: string;
  isActive: boolean;
}) {
  const companyId = await getCompanyId();

  if (!params.fieldId) {
    throw new Error("ID do campo de medição não informado.");
  }

  const updated = await mappaFetch<ApiMeasurementField>(
    `/api/companies/${companyId}/measurement-fields/${params.fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: undefined,
        isActive: params.isActive,
      }),
    },
  );

  revalidatePath("/settings/measurement-fields");

  return normalizeField(updated, 0);
}

export async function deleteMeasurementField(fieldId: string) {
  const companyId = await getCompanyId();

  if (!fieldId) {
    throw new Error("ID do campo de medição não informado.");
  }

  await mappaFetch<null>(
    `/api/companies/${companyId}/measurement-fields/${fieldId}`,
    {
      method: "DELETE",
    },
  );

  revalidatePath("/settings/measurement-fields");

  return {
    ok: true,
  };
}