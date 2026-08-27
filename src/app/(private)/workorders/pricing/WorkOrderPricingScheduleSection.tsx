"use client";

import {
  CalendarDays,
} from "lucide-react";

import FormField from "@/components/form-layout/FormField";
import StepFormSection from "@/components/form-layout/StepFormSection";

import {
  Input,
} from "@/components/ui/input";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  todayIso,
} from "./work-order-pricing.helpers";

type WorkOrderPricingScheduleSectionProps = {
  scheduledDate: string;
  notes: string;
  pending: boolean;

  onScheduledDateChange: (
    value: string,
  ) => void;

  onNotesChange: (
    value: string,
  ) => void;
};

export default function WorkOrderPricingScheduleSection({
  scheduledDate,
  notes,
  pending,
  onScheduledDateChange,
  onNotesChange,
}: WorkOrderPricingScheduleSectionProps) {
  return (
    <StepFormSection
      step={2}
      icon={CalendarDays}
      title="Agendamento e observações"
      description="Defina a data prevista e registre informações importantes para a execução do atendimento."
    >
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <FormField
          htmlFor="pricing-scheduled-date"
          label="Data agendada"
          required
        >
          <Input
            id="pricing-scheduled-date"
            type="date"
            min={todayIso()}
            value={
              scheduledDate
            }
            onChange={(
              event,
            ) =>
              onScheduledDateChange(
                event.target
                  .value,
              )
            }
            className="h-11 rounded-xl"
            disabled={
              pending
            }
          />
        </FormField>

        <FormField
          htmlFor="pricing-notes"
          label="Descrição e observações"
          optional
          description="Registre o problema relatado, peças necessárias, instruções e referências para o técnico."
        >
          <Textarea
            id="pricing-notes"
            value={notes}
            onChange={(
              event,
            ) =>
              onNotesChange(
                event.target
                  .value,
              )
            }
            placeholder="Ex.: Bomba apresentando ruído. Verificar rolamento, registrar diagnóstico e enviar orçamento."
            rows={6}
            className="min-h-[148px] resize-y rounded-xl"
            disabled={
              pending
            }
          />
        </FormField>
      </div>
    </StepFormSection>
  );
}