"use client";

import * as React from "react";
import WeekdayColumn from "@/components/routes/WeekdayColumn";

import {
  WEEKDAY_OPTIONS,
  type PlannedRouteOrder,
  type RouteWeekday,
} from "@/components/routes/routeBuilderMockTypes";

const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

function slotHour(time: string) {
  return Number(time.split(":")[0] || 0);
}

function ordersForDayAndSlot(
  orders: PlannedRouteOrder[],
  day: RouteWeekday,
  slot: string,
) {
  const hour = slotHour(slot);

  return orders
    .filter((order) => {
      const orderHour = slotHour(order.scheduledTime);

      return order.weekdays.includes(day) && orderHour === hour;
    })
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export default function WeeklyTechnicianBoard({
  orders,
  onRemoveOrder,
  onUpdateOrder,
  onMoveOrder,
}: {
  orders: PlannedRouteOrder[];
  onRemoveOrder: (plannedId: string) => void;
  onUpdateOrder: (
    plannedId: string,
    patch: Partial<Pick<PlannedRouteOrder, "scheduledTime" | "weekdays">>,
  ) => void;
  onMoveOrder: (plannedId: string, direction: "up" | "down") => void;
}) {
  const totalByDay = React.useMemo(() => {
    const map = new Map<RouteWeekday, number>();

    for (const weekday of WEEKDAY_OPTIONS) {
      map.set(
        weekday.value,
        orders.filter((order) => order.weekdays.includes(weekday.value))
          .length,
      );
    }

    return map;
  }, [orders]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <div className="min-w-[1680px]">
          <div className="grid grid-cols-[150px_repeat(12,125px)] border-b border-slate-200 bg-slate-50">
            <div className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dia
            </div>

            {TIME_SLOTS.map((slot) => (
              <div
                key={slot}
                className="border-r border-slate-200 px-3 py-3 text-center text-xs font-semibold text-slate-700 last:border-r-0"
              >
                {slot}
              </div>
            ))}
          </div>

          {WEEKDAY_OPTIONS.map((weekday) => (
            <div
              key={weekday.value}
              className="grid min-h-[170px] grid-cols-[150px_repeat(12,125px)] border-b border-slate-200 last:border-b-0"
            >
              <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-3">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {weekday.label}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {totalByDay.get(weekday.value) ?? 0} atendimento
                      {(totalByDay.get(weekday.value) ?? 0) === 1 ? "" : "s"}
                    </div>
                  </div>

                  <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {weekday.short}
                  </span>
                </div>
              </div>

              {TIME_SLOTS.map((slot) => (
                <WeekdayColumn
                  key={`${weekday.value}-${slot}`}
                  day={weekday.value}
                  slot={slot}
                  orders={ordersForDayAndSlot(orders, weekday.value, slot)}
                  onRemoveOrder={onRemoveOrder}
                  onUpdateOrder={onUpdateOrder}
                  onMoveOrder={onMoveOrder}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
          Nenhuma OS adicionada ainda. Adicione uma OS aprovada para visualizar
          o planejamento por dia e horário.
        </div>
      )}
    </div>
  );
}