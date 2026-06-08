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
}: {
  orders: PlannedRouteOrder[];
  onRemoveOrder: (plannedId: string) => void;
  onUpdateOrder: (
    plannedId: string,
    patch: Partial<Pick<PlannedRouteOrder, "scheduledTime" | "weekdays">>,
  ) => void;
  onMoveOrder: (plannedId: string, direction: "up" | "down") => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

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

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }

    const element = scrollRef.current;
    if (!element) return;

    isDraggingRef.current = true;
    startXRef.current = event.pageX - element.offsetLeft;
    scrollLeftRef.current = element.scrollLeft;
    element.classList.add("cursor-grabbing", "select-none");
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;

    event.preventDefault();

    const element = scrollRef.current;
    if (!element) return;

    const x = event.pageX - element.offsetLeft;
    const walk = (x - startXRef.current) * 1.35;

    element.scrollLeft = scrollLeftRef.current - walk;
  }

  function stopDragging() {
    const element = scrollRef.current;

    isDraggingRef.current = false;

    if (element) {
      element.classList.remove("cursor-grabbing", "select-none");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        ref={scrollRef}
        className="cursor-grab overflow-x-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        <div className="min-w-[2040px]">
          <div className="grid grid-cols-[120px_repeat(12,160px)] border-b border-slate-200 bg-slate-50">
            <div className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Dia
            </div>

            {TIME_SLOTS.map((slot) => (
              <div
                key={slot}
                className="border-r border-slate-200 px-3 py-2 text-center text-[11px] font-semibold text-slate-700 last:border-r-0"
              >
                {slot}
              </div>
            ))}
          </div>

          {WEEKDAY_OPTIONS.map((weekday) => {
            const total = totalByDay.get(weekday.value) ?? 0;

            return (
              <div
                key={weekday.value}
                className="grid min-h-[126px] grid-cols-[120px_repeat(12,160px)] border-b border-slate-200 last:border-b-0"
              >
                <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {weekday.label}
                      </div>

                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {total} atendimento{total === 1 ? "" : "s"}
                      </div>
                    </div>

                    <span className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
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
                  />
                ))}
              </div>
            );
          })}
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