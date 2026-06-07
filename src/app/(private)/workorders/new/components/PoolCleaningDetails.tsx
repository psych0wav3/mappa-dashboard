"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

export type Frequency =
  | "ONCE"
  | "WEEKLY_ONCE"
  | "WEEKLY_TWICE"
  | "WEEKLY_THREE_TIMES"
  | "WEEKLY_FOUR_TIMES"
  | "DAILY"
  | "BIWEEKLY"
  | "MONTHLY";

export const POOL_CLEANING_FREQUENCIES: Array<{
  value: Frequency;
  label: string;
  description: string;
}> = [
  {
    value: "ONCE",
    label: "Avulsa",
    description: "Uma limpeza pontual, sem recorrência.",
  },
  {
    value: "WEEKLY_ONCE",
    label: "Semanal",
    description: "1x por semana.",
  },
  {
    value: "WEEKLY_TWICE",
    label: "2x por semana",
    description: "Duas limpezas por semana.",
  },
  {
    value: "WEEKLY_THREE_TIMES",
    label: "3x por semana",
    description: "Três limpezas por semana.",
  },
  {
    value: "WEEKLY_FOUR_TIMES",
    label: "4x por semana",
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

export function frequencyLabel(value: Frequency) {
  const found = POOL_CLEANING_FREQUENCIES.find((item) => item.value === value);

  return found?.label ?? "Avulsa";
}

export function frequencyDescription(value: Frequency) {
  const found = POOL_CLEANING_FREQUENCIES.find((item) => item.value === value);

  return found?.description ?? "Uma limpeza pontual.";
}

function formatCurrencyFromText(value: string) {
  return value || "R$ 0,00";
}

export default function PoolCleaningDetails({
  frequency,
  onFrequencyChange,
  cleaningAmount,
  onCleaningAmountChange,
}: {
  frequency: Frequency;
  onFrequencyChange: (frequency: Frequency) => void;
  cleaningAmount: string;
  onCleaningAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr_180px] lg:items-start">
          <div className="space-y-1">
            <label className="block h-5 text-sm font-medium text-slate-700">
              Serviço
            </label>

            <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800">
              Limpeza de piscina
            </div>
          </div>

          <div className="space-y-1">
            <label className="block h-5 text-sm font-medium text-slate-700">
              Frequência
            </label>

            <select
              value={frequency}
              onChange={(event) =>
                onFrequencyChange(event.target.value as Frequency)
              }
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            >
              {POOL_CLEANING_FREQUENCIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} — {item.description}
                </option>
              ))}
            </select>
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
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Serviço</th>
              <th className="p-3 text-left">Frequência</th>
              <th className="p-3 text-left">Detalhe</th>
              <th className="p-3 text-right">Valor</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="p-3 font-medium text-slate-800">
                Limpeza de piscina
              </td>

              <td className="p-3">
                <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                  {frequencyLabel(frequency)}
                </span>
              </td>

              <td className="p-3 text-slate-600">
                {frequencyDescription(frequency)}
              </td>

              <td className="p-3 text-right font-semibold text-slate-800">
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