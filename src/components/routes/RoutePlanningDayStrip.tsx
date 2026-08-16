"use client";

import {
  CalendarDays,
} from "lucide-react";

import type {
  RouteWeekday,
} from "@/app/(private)/routes/routes.types";

import {
  ROUTE_WEEKDAYS,
} from "./routeWeek.utils";

export type PlanningDayMeta = {
  count: number;
  saved: boolean;
};

type RoutePlanningDayStripProps = {
  selectedWeekday:
    RouteWeekday;

  dayMeta: Record<
    RouteWeekday,
    PlanningDayMeta
  >;

  onSelectWeekday: (
    weekday: RouteWeekday,
  ) => void;
};

export default function RoutePlanningDayStrip({
  selectedWeekday,
  dayMeta,
  onSelectWeekday,
}: RoutePlanningDayStripProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarDays className="h-4 w-4 text-sky-600" />

          Semana padrão
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Organize uma vez. A sequência será usada em todas as ocorrências daquele dia da semana.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {ROUTE_WEEKDAYS.map(
          (day) => {
            const meta =
              dayMeta[
                day.value
              ] ?? {
                count: 0,
                saved: false,
              };

            const selected =
              selectedWeekday ===
              day.value;

            return (
              <button
                key={
                  day.value
                }
                type="button"
                onClick={() =>
                  onSelectWeekday(
                    day.value,
                  )
                }
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100"
                    : "border-slate-200 bg-white hover:border-sky-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold ${
                      selected
                        ? "text-sky-700"
                        : "text-slate-600"
                    }`}
                  >
                    {
                      day.short
                    }
                  </span>

                  {meta.saved ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      Salva
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 text-sm font-bold text-slate-900">
                  {
                    day.label
                  }
                </div>

                <div className="mt-1 text-[11px] text-slate-500">
                  {meta.count}{" "}

                  {meta.count ===
                  1
                    ? "atendimento"
                    : "atendimentos"}
                </div>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}