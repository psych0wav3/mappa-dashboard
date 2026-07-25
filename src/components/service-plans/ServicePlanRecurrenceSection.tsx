import {
  Check,
  ChevronDown,
  Clock3,
} from "lucide-react";

import type { RecurrenceFrequencyType } from "@/app/(private)/service-plans/actions";

import { WEEKDAYS } from "@/app/(private)/service-plans/service-plans.constants";

import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import StepFormSection from "@/components/form-layout/StepFormSection";
import { Input } from "@/components/ui/input";

type ServicePlanRecurrenceSectionProps = {
  frequencyType: RecurrenceFrequencyType;
  daysOfWeek: number[];
  dayOfMonth: number;
  recurrencePreview: string;
  pending: boolean;
  onFrequencyChange: (
    value: RecurrenceFrequencyType,
  ) => void;
  onToggleWeekday: (day: number) => void;
  onDayOfMonthChange: (day: number) => void;
};

export function ServicePlanRecurrenceSection({
  frequencyType,
  daysOfWeek,
  dayOfMonth,
  recurrencePreview,
  pending,
  onFrequencyChange,
  onToggleWeekday,
  onDayOfMonthChange,
}: ServicePlanRecurrenceSectionProps) {
  function handleDayOfMonthChange(value: string) {
    const parsedValue = Number(value || 1);

    const normalizedValue = Math.min(
      31,
      Math.max(
        1,
        Math.floor(
          Number.isFinite(parsedValue)
            ? parsedValue
            : 1,
        ),
      ),
    );

    onDayOfMonthChange(normalizedValue);
  }

  return (
    <StepFormSection
      step={3}
      icon={Clock3}
      title="Regra de recorrência"
      description="Configure quando os atendimentos deverão acontecer."
    >
      <FormField
        htmlFor="service-plan-frequency"
        label="Frequência"
        required
      >
        <div className="relative">
          <select
            id="service-plan-frequency"
            value={frequencyType}
            onChange={(event) =>
              onFrequencyChange(
                event.target
                  .value as RecurrenceFrequencyType,
              )
            }
            disabled={pending}
            className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="DAILY">
              Diária
            </option>

            <option value="WEEKLY">
              Semanal
            </option>

            <option value="MONTHLY">
              Mensal
            </option>
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </FormField>

      {frequencyType === "WEEKLY" && (
        <FormField
          label="Dias da semana"
          required
          className="mt-5"
        >
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {WEEKDAYS.map((day) => {
              const selected = daysOfWeek.includes(
                day.value,
              );

              return (
                <button
                  key={day.value}
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    onToggleWeekday(day.value)
                  }
                  aria-pressed={selected}
                  title={day.label}
                  className={[
                    "relative h-11 rounded-xl border text-sm font-semibold transition",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    selected
                      ? "border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {selected && (
                    <Check className="absolute right-1.5 top-1.5 h-3 w-3" />
                  )}

                  {day.shortLabel}
                </button>
              );
            })}
          </div>
        </FormField>
      )}

      {frequencyType === "MONTHLY" && (
        <FormField
          htmlFor="service-plan-day-of-month"
          label="Dia do mês"
          required
          className="mt-5 max-w-sm"
        >
          <Input
            id="service-plan-day-of-month"
            type="number"
            min={1}
            max={31}
            step={1}
            value={dayOfMonth}
            disabled={pending}
            onChange={(event) =>
              handleDayOfMonthChange(
                event.target.value,
              )
            }
            className="h-11 rounded-xl"
          />
        </FormField>
      )}

      <FormInfoBox
        icon={Clock3}
        className="mt-5"
      >
        <div className="font-semibold">
          Resumo da recorrência
        </div>

        <p className="mt-1 text-slate-600">
          {recurrencePreview}
        </p>
      </FormInfoBox>
    </StepFormSection>
  );
}