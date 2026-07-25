import {
  CalendarDays,
  DollarSign,
} from "lucide-react";

import { todayIso } from "@/app/(private)/service-plans/service-plans.helpers";

import FormField from "@/components/form-layout/FormField";
import StepFormSection from "@/components/form-layout/StepFormSection";
import { Input } from "@/components/ui/input";

type ServicePlanStartValueSectionProps = {
  startDate: string;
  totalAmount: string;
  pending: boolean;
  onStartDateChange: (value: string) => void;
  onTotalAmountChange: (value: string) => void;
};

export function ServicePlanStartValueSection({
  startDate,
  totalAmount,
  pending,
  onStartDateChange,
  onTotalAmountChange,
}: ServicePlanStartValueSectionProps) {
  return (
    <StepFormSection
      step={2}
      icon={CalendarDays}
      title="Início e valor"
      description="Informe quando a rotina deverá começar e o valor que será apresentado ao cliente."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          htmlFor="service-plan-start-date"
          label="Data de início"
          required
        >
          <Input
            id="service-plan-start-date"
            type="date"
            value={startDate}
            onChange={(event) =>
              onStartDateChange(event.target.value)
            }
            min={todayIso()}
            className="h-11 rounded-xl"
            disabled={pending}
          />
        </FormField>

        <FormField
          htmlFor="service-plan-total-amount"
          label="Valor da mensalidade"
          required
          description="Este valor será exibido na solicitação enviada ao cliente."
        >
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              id="service-plan-total-amount"
              value={totalAmount}
              onChange={(event) =>
                onTotalAmountChange(event.target.value)
              }
              inputMode="decimal"
              placeholder="Ex.: 500,00"
              className="h-11 rounded-xl pl-10"
              disabled={pending}
            />
          </div>
        </FormField>
      </div>
    </StepFormSection>
  );
}