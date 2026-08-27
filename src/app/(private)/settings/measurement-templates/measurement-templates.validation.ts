import { toApiMeasurementFieldType } from "./measurement-templates.normalizers";
import type { SaveMeasurementTemplateInput } from "./measurement-templates.types";

export function validateMeasurementTemplateInput(input: SaveMeasurementTemplateInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Informe o nome do template de medição.");
  if (!input.fields.length) throw new Error("Informe ao menos um campo no template.");

  return {
    name,
    description: input.description?.trim() || null,
    isActive: input.isActive !== false,
    fields: input.fields.map((field, index) => ({
      id: field.id && !field.id.startsWith("local-") ? field.id : null,
      name: field.fieldName || field.label,
      label: field.label,
      fieldType: toApiMeasurementFieldType(field.fieldType),
      unit: field.unit || null,
      minValue: field.minValue ?? 0,
      maxValue: field.maxValue ?? 0,
      isRequired: field.isRequired,
      displayOrder: index + 1,
      isActive: field.isActive !== false,
    })),
  };
}
