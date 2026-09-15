import { toApiMeasurementFieldType } from "./measurement-templates.normalizers";
import type { SaveMeasurementTemplateInput } from "./measurement-templates.types";

function normalizeNullableNumber(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function validateMeasurementTemplateInput(input: SaveMeasurementTemplateInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Informe o nome do template de medição.");
  if (!input.fields.length) throw new Error("Informe ao menos um campo no template.");

  return {
    name,
    description: input.description?.trim() || null,
    isActive: input.isActive !== false,
    fields: input.fields.map((field, index) => {
      const isNumber = field.fieldType === "NUMBER";
      const minValue = isNumber ? normalizeNullableNumber(field.minValue) : null;
      const maxValue = isNumber ? normalizeNullableNumber(field.maxValue) : null;

      if (minValue !== null && maxValue !== null && minValue > maxValue) {
        throw new Error(`O mínimo de "${field.label}" não pode ser maior que o máximo.`);
      }

      return {
        id: field.id && !field.id.startsWith("local-") ? field.id : null,
        name: field.fieldName || field.label,
        label: field.label,
        fieldType: toApiMeasurementFieldType(field.fieldType),
        unit: isNumber ? field.unit?.trim() || null : null,
        minValue,
        maxValue,
        isRequired: field.isRequired,
        displayOrder: index + 1,
        isActive: field.isActive !== false,
      };
    }),
  };
}
