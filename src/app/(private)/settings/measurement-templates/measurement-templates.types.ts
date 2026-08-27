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

export type ApiMeasurementTemplateField = {
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

export type ApiMeasurementTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  fields?: ApiMeasurementTemplateField[] | null;
  measurementFields?: ApiMeasurementTemplateField[] | null;
};

export type SaveMeasurementTemplateInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  fields: MeasurementTemplateField[];
};
