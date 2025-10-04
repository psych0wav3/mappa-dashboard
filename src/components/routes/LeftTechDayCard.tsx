"use client";

import * as React from "react";
import TechCombobox, { TechLite } from "./TechCombobox";

const WEEKDAYS = [
  { v: 1, l: "Seg" },
  { v: 2, l: "Ter" },
  { v: 3, l: "Qua" },
  { v: 4, l: "Qui" },
  { v: 5, l: "Sex" },
  { v: 6, l: "Sáb" },
];

export default function LeftTechDayCard({
  technicians,
  techId,
  onTechChange,
  weekday,
  onWeekdayChange,
}: {
  technicians: TechLite[];
  techId?: string;
  onTechChange: (id: string) => void;
  weekday: number;
  onWeekdayChange: (v: number) => void;
}) {
  return (
    <div className="rounded-md border bg-white">
      {/* cabeçalho sem botões extras */}
      <div className="px-3 py-2 border-b text-sm font-medium text-neutral-700">
        Técnico e dia
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
          <label className="text-xs font-medium text-neutral-600">Dia da semana</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d) => (
              <button
                key={d.v}
                className={`h-8 px-2 rounded border text-xs ${
                  weekday === d.v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-neutral-300 hover:bg-neutral-50"
                }`}
                onClick={() => onWeekdayChange(d.v)}
                type="button"
              >
                {d.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
