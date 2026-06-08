"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Frequency =
  | "ONCE"
  | "WEEKLY_ONCE"
  | "WEEKLY_TWICE"
  | "WEEKLY_THREE_TIMES"
  | "WEEKLY_FOUR_TIMES"
  | "DAILY"
  | "BIWEEKLY"
  | "MONTHLY";

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const POOL_CLEANING_FREQUENCIES: Array<{
  value: Frequency;
  label: string;
  description: string;
}> = [
  {
    value: "ONCE",
    label: "Avulsa",
    description: "Uma limpeza pontual.",
  },
  {
    value: "WEEKLY_ONCE",
    label: "Semanal",
    description: "1x por semana.",
  },
  {
    value: "WEEKLY_TWICE",
    label: "2x",
    description: "Duas limpezas por semana.",
  },
  {
    value: "WEEKLY_THREE_TIMES",
    label: "3x",
    description: "Três limpezas por semana.",
  },
  {
    value: "WEEKLY_FOUR_TIMES",
    label: "4x",
    description: "Quatro limpezas por semana.",
  },
  {
    value: "DAILY",
    label: "Diária",
    description: "Todos os dias.",
  },
  {
    value: "BIWEEKLY",
    label: "Quinzenal",
    description: "A cada 15 dias.",
  },
  {
    value: "MONTHLY",
    label: "Mensal",
    description: "Uma vez por mês.",
  },
];

const WEEKDAY_OPTIONS: Array<{
  value: Weekday;
  short: string;
  label: string;
}> = [
  { value: "MONDAY", short: "Seg", label: "Segunda" },
  { value: "TUESDAY", short: "Ter", label: "Terça" },
  { value: "WEDNESDAY", short: "Qua", label: "Quarta" },
  { value: "THURSDAY", short: "Qui", label: "Quinta" },
  { value: "FRIDAY", short: "Sex", label: "Sexta" },
  { value: "SATURDAY", short: "Sáb", label: "Sábado" },
  { value: "SUNDAY", short: "Dom", label: "Domingo" },
];

const ALL_WEEKDAYS = WEEKDAY_OPTIONS.map((item) => item.value);

export function frequencyLabel(value: Frequency) {
  return (
    POOL_CLEANING_FREQUENCIES.find((item) => item.value === value)?.label ??
    "Avulsa"
  );
}

export function frequencyDescription(value: Frequency) {
  return (
    POOL_CLEANING_FREQUENCIES.find((item) => item.value === value)
      ?.description ?? "Uma limpeza pontual."
  );
}

export function weekdayLabel(value: Weekday) {
  return WEEKDAY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function weekdaysLabel(values: Weekday[]) {
  if (!values.length) return "Não se aplica";

  return values.map(weekdayLabel).join(", ");
}

function formatCurrencyFromText(value: string) {
  return value || "R$ 0,00";
}

function weekdayLimit(frequency: Frequency) {
  const map: Record<Frequency, number> = {
    ONCE: 0,
    WEEKLY_ONCE: 1,
    WEEKLY_TWICE: 2,
    WEEKLY_THREE_TIMES: 3,
    WEEKLY_FOUR_TIMES: 4,
    DAILY: 7,
    BIWEEKLY: 1,
    MONTHLY: 1,
  };

  return map[frequency];
}

function weekdayHelper(frequency: Frequency) {
  const limit = weekdayLimit(frequency);

  if (frequency === "ONCE") {
    return "Limpeza avulsa não precisa de dia fixo.";
  }

  if (frequency === "DAILY") {
    return "Na limpeza diária, todos os dias ficam selecionados.";
  }

  if (limit === 1) {
    return "Escolha 1 dia da semana.";
  }

  return `Escolha ${limit} dias da semana.`;
}

export default function PoolCleaningDetails({
  frequency,
  onFrequencyChange,
  selectedWeekdays,
  onWeekdaysChange,
  cleaningAmount,
  onCleaningAmountChange,
}: {
  frequency: Frequency;
  onFrequencyChange: (frequency: Frequency) => void;
  selectedWeekdays: Weekday[];
  onWeekdaysChange: (weekdays: Weekday[]) => void;
  cleaningAmount: string;
  onCleaningAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const limit = weekdayLimit(frequency);
  const shouldShowWeekdays = frequency !== "ONCE";

  React.useEffect(() => {
    if (frequency === "ONCE") {
      if (selectedWeekdays.length > 0) {
        onWeekdaysChange([]);
      }

      return;
    }

    if (frequency === "DAILY") {
      const same =
        selectedWeekdays.length === ALL_WEEKDAYS.length &&
        ALL_WEEKDAYS.every((day) => selectedWeekdays.includes(day));

      if (!same) {
        onWeekdaysChange(ALL_WEEKDAYS);
      }

      return;
    }

    if (selectedWeekdays.length > limit) {
      onWeekdaysChange(selectedWeekdays.slice(0, limit));
    }
  }, [frequency, limit, onWeekdaysChange, selectedWeekdays]);

  function handleFrequencyClick(nextFrequency: Frequency) {
    onFrequencyChange(nextFrequency);
  }

  function toggleWeekday(day: Weekday) {
    if (frequency === "DAILY") return;

    const alreadySelected = selectedWeekdays.includes(day);

    if (alreadySelected) {
      onWeekdaysChange(selectedWeekdays.filter((item) => item !== day));
      return;
    }

    if (selectedWeekdays.length >= limit) {
      const next = [...selectedWeekdays.slice(1), day];
      onWeekdaysChange(next);
      return;
    }

    onWeekdaysChange([...selectedWeekdays, day]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <div className="space-y-1">
            <label className="block h-5 text-sm font-medium text-slate-700">
              Frequência
            </label>

            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
              {POOL_CLEANING_FREQUENCIES.map((item) => {
                const selected = frequency === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleFrequencyClick(item.value)}
                    className={cn(
                      "min-h-[74px] rounded-xl border px-3 py-2 text-left transition-all",
                      selected
                        ? "border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-semibold leading-5",
                        selected ? "text-sky-900" : "text-slate-900",
                      )}
                    >
                      {item.label}
                    </div>

                    <div
                      className={cn(
                        "mt-1 text-[11px] leading-4",
                        selected ? "text-sky-700" : "text-slate-600",
                      )}
                    >
                      {item.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block h-5 text-sm font-medium text-slate-700">
              Valor da limpeza
            </label>

            <Input
              inputMode="numeric"
              value={cleaningAmount}
              onChange={onCleaningAmountChange}
              onFocus={(event) => event.currentTarget.select()}
              placeholder="R$ 0,00"
              className="h-10"
            />
          </div>
        </div>

        {shouldShowWeekdays && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">
                  Dias da semana
                </div>

                <div className="text-xs text-slate-500">
                  {weekdayHelper(frequency)}
                </div>
              </div>

              <div className="text-xs font-medium text-slate-500">
                {frequency === "DAILY"
                  ? "7/7 dias"
                  : `${selectedWeekdays.length}/${limit} selecionado${
                      limit > 1 ? "s" : ""
                    }`}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {WEEKDAY_OPTIONS.map((day) => {
                const selected = selectedWeekdays.includes(day.value);
                const disabled = frequency === "DAILY";

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    disabled={disabled}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all",
                      selected
                        ? "border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-100"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                      disabled && "cursor-not-allowed opacity-80",
                    )}
                  >
                    <div>{day.short}</div>

                    <div className="mt-0.5 text-[11px] font-normal">
                      {day.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[20%]" />
            <col className="w-[34%]" />
            <col className="w-[16%]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-semibold text-slate-700">
                Serviço
              </th>

              <th className="p-3 text-left font-semibold text-slate-700">
                Frequência
              </th>

              <th className="p-3 text-left font-semibold text-slate-700">
                Dias
              </th>

              <th className="p-3 text-right font-semibold text-slate-700">
                Valor
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="p-3 align-middle font-medium text-slate-800">
                Limpeza de piscina
              </td>

              <td className="p-3 align-middle">
                <span className="inline-flex min-w-[96px] justify-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                  {frequencyLabel(frequency)}
                </span>
              </td>

              <td className="p-3 align-middle text-slate-600">
                <span className="block truncate">
                  {frequency === "ONCE"
                    ? "Não se aplica"
                    : weekdaysLabel(selectedWeekdays)}
                </span>
              </td>

              <td className="p-3 align-middle text-right font-semibold text-slate-800">
                {formatCurrencyFromText(cleaningAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
        A recorrência será ativada quando o backend liberar os planos
        recorrentes. Por enquanto, será criada uma OS para a data agendada,
        mantendo a frequência registrada na descrição.
      </div>
    </div>
  );
}