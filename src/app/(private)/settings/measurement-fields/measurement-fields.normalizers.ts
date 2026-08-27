import { normalizeMeasurementFieldType } from "../measurement-templates/measurement-templates.normalizers";
import type {
  ApiMeasurementField,
  MeasurementField,
} from "./measurement-fields.types";

export function normalizeMeasurementField(
  field: ApiMeasurementField,
  index = 0,
): MeasurementField {
  const name = field.name?.trim() || "campo-sem-nome";

  return {
    id: field.id,
    name,
    label: field.label?.trim() || name,
    fieldType: normalizeMeasurementFieldType(field.fieldType),
    unit: field.unit?.trim() || null,
    minValue: field.minValue ?? null,
    maxValue: field.maxValue ?? null,
    isRequired: field.isRequired === true,
    displayOrder: field.displayOrder ?? index + 1,
    isActive: field.isActive !== false,
    createdAt: field.createdAt ?? null,
  };
}
