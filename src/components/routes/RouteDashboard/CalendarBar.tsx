"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { addDays, formatLongDate, getWeekStrip, toISODate } from "./types";

type Props = {
  dateISO: string;
  onChangeDate: (iso: string) => void;
  onRefresh: () => void;
};

export default function CalendarBar({ dateISO, onChangeDate, onRefresh }: Props) {
  const week = getWeekStrip(dateISO);

  return (
    <div className="px-4 py-3" style={{ background: "var(--ac-blue-700)", color: "white" }}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="font-semibold">{formatLongDate(dateISO)}</div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeDate(addDays(dateISO, -1))}
            className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center"
            title="Dia anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-stretch rounded-md overflow-hidden border border-white/30">
            {week.map((d) => (
              <button
                key={d.iso}
                onClick={() => onChangeDate(d.iso)}
                className={`px-3 py-1.5 text-sm border-l border-white/20 first:border-l-0 ${
                  d.iso === dateISO
                    ? "bg-white font-semibold"
                    : d.isToday
                    ? "bg-white/10"
                    : "bg-transparent hover:bg-white/10"
                }`}
                style={d.iso === dateISO ? { color: "var(--ac-blue-700)" } : undefined}
              >
                <div className="leading-none">{d.wd}</div>
                <div className="text-xs opacity-90">{d.dd}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => onChangeDate(addDays(dateISO, +1))}
            className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center"
            title="Próximo dia"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onChangeDate(toISODate(new Date()))}
            className="h-8 rounded-md bg-white px-3 text-sm font-medium hover:bg-neutral-100"
            style={{ color: "var(--ac-blue-700)" }}
          >
            Hoje
          </button>
          <label
            className="h-8 rounded-md bg-white px-3 text-sm font-medium hover:bg-neutral-100 inline-flex items-center gap-2 cursor-pointer"
            style={{ color: "var(--ac-blue-700)" }}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Calendário</span>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => onChangeDate(e.target.value)}
              className="sr-only"
            />
          </label>
          <button
            onClick={onRefresh}
            className="h-8 rounded-md bg-white px-3 text-sm font-medium hover:bg-neutral-100 inline-flex items-center gap-2"
            style={{ color: "var(--ac-blue-700)" }}
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}
