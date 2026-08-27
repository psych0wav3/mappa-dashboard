import type {
  ApiMeasurementTemplate,
  ApiMeasurementTemplateField,
  MeasurementFieldType,
  MeasurementTemplate,
  MeasurementTemplateField,
} from "./measurement-templates.types";

export function normalizeMeasurementFieldType(value?: string | null): MeasurementFieldType {
  const normalized = String(value || "NUMBER").toUpperCase();
  if (normalized === "TEXT") return "TEXT";
  if (normalized === "BOOLEAN") return "BOOLEAN";
  return "NUMBER";
}

export function toApiMeasurementFieldType(
  value: MeasurementFieldType,
): "Number" | "Text" | "Boolean" {
  const types: Record<MeasurementFieldType, "Number" | "Text" | "Boolean"> = {
    NUMBER: "Number",
    TEXT: "Text",
    BOOLEAN: "Boolean",
  };
  return types[value] || "Number";
}

function normalizeTemplateField(
  field: ApiMeasurementTemplateField,
  index: number,
): MeasurementTemplateField {
  const fieldName = field.fieldName || field.name || "";
  return {
    id: field.id,
    fieldName,
    label: field.label || field.name || fieldName || "Campo sem nome",
    fieldType: normalizeMeasurementFieldType(field.fieldType || field.valueType),
    unit: field.unit ?? null,
    minValue: field.minValue ?? null,
    maxValue: field.maxValue ?? null,
    isRequired: field.isRequired === true,
    isActive: field.isActive !== false,
    displayOrder: field.displayOrder ?? index + 1,
  };
}

export function normalizeMeasurementTemplate(
  template: ApiMeasurementTemplate,
): MeasurementTemplate {
  const apiFields = Array.isArray(template.fields)
    ? template.fields
    : Array.isArray(template.measurementFields)
      ? template.measurementFields
      : [];
  const fields = apiFields
    .map(normalizeTemplateField)
    .filter((field) => field.isActive !== false)
    .sort((first, second) => first.displayOrder - second.displayOrder);

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
