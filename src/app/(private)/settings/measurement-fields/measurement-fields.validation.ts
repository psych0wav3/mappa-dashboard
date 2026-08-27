import { toApiMeasurementFieldType } from "../measurement-templates/measurement-templates.normalizers";
import type { SaveMeasurementFieldInput } from "./measurement-fields.types";

const FIELD_NAME_PATTERN = /^[a-z0-9_-]+$/i;

function normalizeNullableNumber(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function validateMeasurementFieldInput(
  input: SaveMeasurementFieldInput,
) {
  const name = input.name.trim();
  const label = input.label.trim();
  const minValue = normalizeNullableNumber(input.minValue);
  const maxValue = normalizeNullableNumber(input.maxValue);

  if (!name) throw new Error("Informe o identificador do campo.");
  if (!FIELD_NAME_PATTERN.test(name)) {
    throw new Error("Use apenas letras, números, hífen ou sublinhado no identificador.");
  }
  if (!label) throw new Error("Informe o nome exibido do campo.");
  if (!Number.isInteger(input.displayOrder) || input.displayOrder <= 0) {
    throw new Error("A ordem deve ser um número inteiro maior que zero.");
  }
  if (minValue !== null && maxValue !== null && minValue > maxValue) {
    throw new Error("O valor mínimo não pode ser maior que o máximo.");
  }

  return {
    name,
    label,
    fieldType: toApiMeasurementFieldType(input.fieldType),
    unit: input.unit?.trim() || null,
    minValue,
    maxValue,
    isRequired: Boolean(input.isRequired),
    displayOrder: input.displayOrder,
    measurementTemplateId: input.measurementTemplateId || null,
  };
}

export function toMeasurementFieldUpdatePayload(
  input: SaveMeasurementFieldInput,
) {
  const validated = validateMeasurementFieldInput(input);

  return {
    label: validated.label,
    fieldType: validated.fieldType,
    unit: validated.unit,
    minValue: validated.minValue,
    maxValue: validated.maxValue,
    isRequired: validated.isRequired,
    displayOrder: validated.displayOrder,
  };
}
