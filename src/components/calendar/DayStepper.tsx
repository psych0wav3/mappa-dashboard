//src/components/calendar/DayStepper.tsx

"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function fromISO(iso: string) { return new Date(iso + "T00:00:00"); }

function fmtLongPt(dateISO: string) {
  const d = fromISO(dateISO);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DayStepper({
  dateISO,
  onChange,
  className = "",
}: {
  dateISO: string;
  onChange: (nextISO: string) => void;
  className?: string;
}) {
  const go = (delta: number) => {
    const d = fromISO(dateISO);
    d.setDate(d.getDate() + delta);
    onChange(toISO(d));
  };

  return (
    <div
      className={
        "inline-flex items-center gap-3 rounded-xl border bg-white px-3 py-2 shadow-sm " +
        className
      }
    >
      <button
        type="button"
        onClick={() => go(-1)}
        className="rounded-md p-1.5 hover:bg-neutral-100"
        title="Dia anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <CalendarDays className="h-4 w-4 text-neutral-600" />
      <span className="select-none text-sm font-semibold">
        {fmtLongPt(dateISO)}
      </span>

      <button
        type="button"
        onClick={() => go(1)}
        className="rounded-md p-1.5 hover:bg-neutral-100"
        title="Próximo dia"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
