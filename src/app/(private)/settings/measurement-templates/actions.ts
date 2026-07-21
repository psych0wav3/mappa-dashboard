"use server";

import { revalidatePath } from "next/cache";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type MeasurementFieldType = "NUMBER" | "TEXT" | "BOOLEAN";

export type MeasurementTemplateField = {
  id: string;
  fieldName: string;
  label: string;
  fieldType: MeasurementFieldType;
  unit?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
};

export type MeasurementTemplate = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  fields: MeasurementTemplateField[];
  fieldsCount: number;
};

type ApiMeasurementTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  fields?: ApiMeasurementTemplateField[] | null;
  measurementFields?: ApiMeasurementTemplateField[] | null;
};

type ApiMeasurementTemplateField = {
  id: string;
  fieldName?: string | null;
  name?: string | null;
  label?: string | null;
  fieldType?: MeasurementFieldType | string | null;
  valueType?: MeasurementFieldType | string | null;
  unit?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired?: boolean | null;
  isActive?: boolean | null;
  displayOrder?: number | null;
};

export type SaveMeasurementTemplateInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  fields: MeasurementTemplateField[];
};

function normalizeFieldType(
  value?: string | null,
): MeasurementFieldType {
  const upperValue = String(value || "NUMBER").toUpperCase();

  if (upperValue === "TEXT") {
    return "TEXT";
  }

  if (upperValue === "BOOLEAN") {
    return "BOOLEAN";
  }

  return "NUMBER";
}

function toApiFieldType(
  value: MeasurementFieldType,
): "Number" | "Text" | "Boolean" {
  const map: Record<
    MeasurementFieldType,
    "Number" | "Text" | "Boolean"
  > = {
    NUMBER: "Number",
    TEXT: "Text",
    BOOLEAN: "Boolean",
  };

  return map[value] || "Number";
}

function normalizeTemplateField(
  field: ApiMeasurementTemplateField,
  index: number,
): MeasurementTemplateField {
  const fieldName = field.fieldName || field.name || "";

  return {
    id: field.id,
    fieldName,
    label:
      field.label ||
      field.name ||
      fieldName ||
      "Campo sem nome",
    fieldType: normalizeFieldType(
      field.fieldType || field.valueType,
    ),
    unit: field.unit ?? null,
    minValue: field.minValue ?? null,
    maxValue: field.maxValue ?? null,
    isRequired: field.isRequired === true,
    isActive: field.isActive !== false,
    displayOrder: field.displayOrder ?? index + 1,
  };
}

function normalizeTemplate(
  template: ApiMeasurementTemplate,
): MeasurementTemplate {
  const apiFields = Array.isArray(template.fields)
    ? template.fields
    : Array.isArray(template.measurementFields)
      ? template.measurementFields
      : [];

  const fields = apiFields.map(normalizeTemplateField);

  return {
    id: template.id,
    name: template.name || "Template sem nome",
    description: template.description ?? null,
    isActive: template.isActive !== false,
    createdAt: template.createdAt ?? null,
    fields,
    fieldsCount: fields.length,
  };
}

function validateInput(input: SaveMeasurementTemplateInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Informe o nome do template de medição.",
    );
  }

  if (!input.fields.length) {
    throw new Error(
      "Informe ao menos um campo no template.",
    );
  }

  return {
    name,
    description: input.description?.trim() || null,
    isActive: input.isActive !== false,
    fields: input.fields.map((field, index) => ({
      id: field.id,
      name: field.fieldName || field.label,
      label: field.label,
      fieldType: toApiFieldType(field.fieldType),
      unit: field.unit || null,
      minValue: field.minValue ?? 0,
      maxValue: field.maxValue ?? 0,
      isRequired: field.isRequired,
      displayOrder: index + 1,
      isActive: field.isActive !== false,
    })),
  };
}

export async function listMeasurementTemplates(): Promise<
  MeasurementTemplate[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/measurement-templates`,
  );

  return extractItems<ApiMeasurementTemplate>(data)
    .map(normalizeTemplate)
    .sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "pt-BR");
    });
}

export async function createMeasurementTemplate(
  input: SaveMeasurementTemplateInput,
): Promise<MeasurementTemplate> {
  const companyId = await getCompanyId();
  const payload = validateInput(input);

  const created = await mappaFetch<ApiMeasurementTemplate>(
    `/api/companies/${companyId}/measurement-templates`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/settings/measurement-templates");
  revalidatePath("/settings/measurement-fields");

  return normalizeTemplate(created);
}

export async function updateMeasurementTemplate(params: {
  templateId: string;
  input: SaveMeasurementTemplateInput;
}): Promise<MeasurementTemplate> {
  const companyId = await getCompanyId();

  if (!params.templateId) {
    throw new Error(
      "ID do template de medição não informado.",
    );
  }

  const payload = validateInput(params.input);

  const updated = await mappaFetch<ApiMeasurementTemplate>(
    `/api/companies/${companyId}/measurement-templates/${params.templateId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/settings/measurement-templates");
  revalidatePath("/settings/measurement-fields");

  return normalizeTemplate(updated);
}