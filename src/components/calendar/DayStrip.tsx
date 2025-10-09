//src/components/calendar/DayStrip.tsx

"use client";

import * as React from "react";

type Props = {
  dateISO: string;                         // referência do mês
  onSelectDay: (nextISO: string) => void;  // dispara ao clicar num dia
  className?: string;
};

function fromISO(iso: string) { return new Date(iso + "T00:00:00Z"); }
function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function daysInMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); }
function setDay(d: Date, day: number) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), day)); }

export default function DayStrip({ dateISO, onSelectDay, className }: Props) {
  const cur = fromISO(dateISO);
  const total = daysInMonth(cur);
  const selected = cur.getUTCDate();

  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 ${className ?? ""}`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((d) => {
        const active = d === selected;
        return (
          <button
            key={d}
            onClick={() => onSelectDay(toISO(setDay(cur, d)))}
            className={[
              "min-w-10 rounded-xl px-3 py-2 text-sm border transition",
              active
                ? "btn-brand text-white"
                : "bg-white border-neutral-300 hover:bg-neutral-50",
            ].join(" ")}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
