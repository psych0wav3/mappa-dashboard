import {
  ChevronDown,
  Settings2,
} from "lucide-react";

import type {
  WorkOrderChecklistTemplateOption,
  WorkOrderMeasurementTemplateOption,
  WorkOrderTechnicianOption,
} from "@/app/(private)/workorders/actions";

import FormField from "@/components/form-layout/FormField";
import StepFormSection from "@/components/form-layout/StepFormSection";
import { Textarea } from "@/components/ui/textarea";

type ServicePlanExecutionSectionProps = {
  technicians: WorkOrderTechnicianOption[];
  checklistTemplates: WorkOrderChecklistTemplateOption[];
  measurementTemplates: WorkOrderMeasurementTemplateOption[];
  preferredEmployeeUserId: string;
  checklistTemplateId: string;
  measurementTemplateId: string;
  description: string;
  pending: boolean;
  onPreferredEmployeeChange: (value: string) => void;
  onChecklistTemplateChange: (value: string) => void;
  onMeasurementTemplateChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

const SELECT_CLASS_NAME =
  "h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  children: React.ReactNode;
  onChange: (value: string) => void;
};

function SelectField({
  id,
  label,
  value,
  disabled,
  children,
  onChange,
}: SelectFieldProps) {
  return (
    <FormField
      htmlFor={id}
      label={label}
    >
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          className={SELECT_CLASS_NAME}
        >
          {children}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FormField>
  );
}

export function ServicePlanExecutionSection({
  technicians,
  checklistTemplates,
  measurementTemplates,
  preferredEmployeeUserId,
  checklistTemplateId,
  measurementTemplateId,
  description,
  pending,
  onPreferredEmployeeChange,
  onChecklistTemplateChange,
  onMeasurementTemplateChange,
  onDescriptionChange,
}: ServicePlanExecutionSectionProps) {
  return (
    <StepFormSection
      step={4}
      icon={Settings2}
      title="Configuração da execução"
      description="Defina o técnico e os registros exigidos durante os atendimentos."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id="service-plan-technician"
          label="Técnico preferencial"
          value={preferredEmployeeUserId}
          disabled={pending}
          onChange={onPreferredEmployeeChange}
        >
          <option value="">
            Sem técnico preferencial
          </option>

          {technicians.map((technician) => (
            <option
              key={technician.id}
              value={technician.id}
            >
              {technician.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="service-plan-checklist"
          label="Checklist da visita"
          value={checklistTemplateId}
          disabled={pending}
          onChange={onChecklistTemplateChange}
        >
          <option value="">
            Usar checklist padrão ativo
          </option>

          {checklistTemplates.map((template) => (
            <option
              key={template.id}
              value={template.id}
            >
              {template.name}
              {template.itemsCount
                ? ` — ${template.itemsCount} itens`
                : ""}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="service-plan-measurement"
          label="Template de medição"
          value={measurementTemplateId}
          disabled={pending}
          onChange={onMeasurementTemplateChange}
        >
          <option value="">
            Usar template padrão ativo
          </option>

          {measurementTemplates.map((template) => (
            <option
              key={template.id}
              value={template.id}
            >
              {template.name}
              {template.fieldsCount
                ? ` — ${template.fieldsCount} campos`
                : ""}
            </option>
          ))}
        </SelectField>

        <FormField
          htmlFor="service-plan-description"
          label="Descrição da rotina"
        >
          <Textarea
            id="service-plan-description"
            value={description}
            onChange={(event) =>
              onDescriptionChange(event.target.value)
            }
            placeholder="Ex.: Limpeza completa, aspiração, escovação e análise da água."
            rows={4}
            disabled={pending}
            className="min-h-[104px] resize-y rounded-xl"
          />
        </FormField>
      </div>
    </StepFormSection>
  );
}