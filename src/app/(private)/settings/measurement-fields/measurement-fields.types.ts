import type {
  MeasurementFieldType,
  MeasurementTemplate,
} from "../measurement-templates/actions";

export type MeasurementField = {
  id: string;
  name: string;
  label: string;
  fieldType: MeasurementFieldType;
  unit?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string | null;
};

export type ApiMeasurementField = {
  id: string;
  name?: string | null;
  label?: string | null;
  fieldType?: MeasurementFieldType | string | null;
  unit?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired?: boolean | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: string | null;
};

export type SaveMeasurementFieldInput = {
  name: string;
  label: string;
  fieldType: MeasurementFieldType;
  unit?: string;
  minValue?: number | null;
  maxValue?: number | null;
  isRequired: boolean;
  displayOrder: number;
  measurementTemplateId?: string | null;
};

export type MeasurementFieldTemplate = Pick<
  MeasurementTemplate,
  "id" | "name" | "isActive" | "fields"
>;
