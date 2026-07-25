import { MapPin, UserRound } from "lucide-react";

import type { WorkOrderCustomerOption } from "@/app/(private)/workorders/actions";

import FormField from "@/components/form-layout/FormField";
import StepFormSection from "@/components/form-layout/StepFormSection";
import { Input } from "@/components/ui/input";

import { CustomerCombobox } from "./CustomerCombobox";

type ServicePlanIdentitySectionProps = {
  customers: WorkOrderCustomerOption[];
  customerId: string;
  selectedCustomer: WorkOrderCustomerOption | null;
  title: string;
  pending: boolean;
  onCustomerChange: (value: string) => void;
  onTitleChange: (value: string) => void;
};

export function ServicePlanIdentitySection({
  customers,
  customerId,
  selectedCustomer,
  title,
  pending,
  onCustomerChange,
  onTitleChange,
}: ServicePlanIdentitySectionProps) {
  return (
    <StepFormSection
      step={1}
      icon={UserRound}
      title="Cliente e identificação"
      description="Defina para qual cliente e piscina a rotina será enviada."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Cliente/Piscina"
          required
        >
          <CustomerCombobox
            customers={customers}
            value={customerId}
            onValueChange={onCustomerChange}
            disabled={pending}
          />

          {selectedCustomer && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

              <span>
                {selectedCustomer.addressLabel}
              </span>
            </div>
          )}
        </FormField>

        <FormField
          htmlFor="service-plan-title"
          label="Nome da rotina"
          required
          description="Use um nome que facilite a identificação do atendimento."
        >
          <Input
            id="service-plan-title"
            value={title}
            onChange={(event) =>
              onTitleChange(event.target.value)
            }
            placeholder="Ex.: Limpeza 2x por semana"
            className="h-11 rounded-xl"
            disabled={pending}
          />
        </FormField>
      </div>
    </StepFormSection>
  );
}