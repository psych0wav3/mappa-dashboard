"use client";

import * as React from "react";
import TechCombobox, { TechLite } from "./TechCombobox";

export default function LeftTechDayCard({
  technicians,
  techId,
  onTechChange,
  dateISO,
  onDateChange,
}: {
  technicians: TechLite[];
  techId?: string;
  onTechChange: (id: string) => void;
  dateISO: string;
  onDateChange: (value: string) => void;
}) {
  return (
    <div className="rounded-md border bg-white">
      <div className="px-3 py-2 border-b text-sm font-medium text-neutral-700">
        Técnico e data
      </div>

      <div className="p-3 space-y-3">
        <TechCombobox
          technicians={technicians}
          value={techId}
          onChange={onTechChange}
          placeholder="Selecionar técnico…"
          label="Técnico"
        />

        <div>
          <label className="text-xs font-medium text-neutral-600">
            Data da rota
          </label>

          <input
            type="date"
            value={dateISO}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          Nesta versão, a rota é criada por data específica. A recorrência
          semanal será conectada quando o backend liberar os planos recorrentes.
        </div>
      </div>
    </div>
  );
}