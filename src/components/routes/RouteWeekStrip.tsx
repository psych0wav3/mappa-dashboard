"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { formatDayMonth, formatWeekLabel, getWeekDays } from "./routeWeek.utils";

type DayMeta = {
  count: number;
  label?: string;
  status?: string;
  statusClassName?: string;
};

type RouteWeekStripProps = {
  weekStartDate: string;
  selectedDate: string;
  todayIso: string;
  dayMeta?: Record<string, DayMeta>;
  countLabel?: string;
  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
  onSelectDate: (date: string) => void;
};

export default function RouteWeekStrip({ weekStartDate, selectedDate, todayIso, dayMeta = {}, countLabel = "atendimentos", onPreviousWeek, onCurrentWeek, onNextWeek, onSelectDate }: RouteWeekStripProps) {
  const weekDays = getWeekDays(weekStartDate);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-sky-600" />
            Semana {formatWeekLabel(weekStartDate)}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Escolha o dia para visualizar e organizar a rota.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={onPreviousWeek} aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl px-3 text-xs" onClick={onCurrentWeek}>
            Hoje
          </Button>

          <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={onNextWeek} aria-label="Próxima semana">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {weekDays.map((day) => {
          const meta = dayMeta[day.date] || { count: 0 };
          const selected = selectedDate === day.date;
          const today = todayIso === day.date;

          return (
            <button key={day.date} type="button" onClick={() => onSelectDate(day.date)} className={`rounded-xl border px-3 py-3 text-left transition ${selected ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100" : "border-slate-200 bg-white hover:border-sky-200"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold ${selected ? "text-sky-700" : "text-slate-600"}`}>{day.short}</span>

                {today && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Hoje</span>}
              </div>

              <div className="mt-1 text-lg font-bold text-slate-900">{formatDayMonth(day.date)}</div>

              <div className="mt-1 text-[11px] text-slate-500">
                {meta.label || `${meta.count} ${meta.count === 1 ? countLabel.replace(/s$/, "") : countLabel}`}
              </div>

              {meta.status && <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${meta.statusClassName || "border-slate-200 bg-slate-50 text-slate-600"}`}>{meta.status}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}