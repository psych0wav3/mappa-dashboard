"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Clock,
  GripVertical,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  WEEKDAY_OPTIONS,
  type RouteWeekday,
  type SelectedRouteOrder,
  weekdayLabel,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

function toggleWeekday(days: RouteWeekday[], day: RouteWeekday) {
  if (days.includes(day)) {
    return days.filter((item) => item !== day);
  }

  return [...days, day];
}

export default function SelectedRouteOrdersCard({
  orders,
  onRemove,
  onMove,
  onChangeOrder,
}: {
  orders: SelectedRouteOrder[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onChangeOrder: (
    id: string,
    patch: Partial<Pick<SelectedRouteOrder, "scheduledTime" | "weekdays">>,
  ) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Rota em montagem
        </h2>
        <p className="text-xs text-slate-500">
          Ajuste ordem, horário previsto e dias antes de criar a rota.
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-sm font-semibold text-white">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      {order.customerName}
                    </div>

                    <div className="mt-0.5 truncate text-sm text-slate-600">
                      {order.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {order.address}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onMove(order.id, "up")}
                      disabled={index === 0}
                      title="Subir"
                    >
                      <ArrowUp size={14} />
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onMove(order.id, "down")}
                      disabled={index === orders.length - 1}
                      title="Descer"
                    >
                      <ArrowDown size={14} />
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 border-red-200 p-0 text-red-600 hover:bg-red-50"
                      onClick={() => onRemove(order.id)}
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Dias da OS
                      </div>

                      {order.serviceKind === "POOL_CLEANING" ? (
                        <div className="grid grid-cols-4 gap-1">
                          {WEEKDAY_OPTIONS.map((day) => {
                            const selected = order.weekdays.includes(day.value);

                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() =>
                                  onChangeOrder(order.id, {
                                    weekdays: toggleWeekday(
                                      order.weekdays,
                                      day.value,
                                    ),
                                  })
                                }
                                className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                                  selected
                                    ? "border-sky-400 bg-sky-50 text-sky-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                                title={weekdayLabel(day.value)}
                              >
                                {day.short}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">
                          {weekdaysLabel(order.weekdays)}
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Clock className="h-3.5 w-3.5" />
                        Horário
                      </div>

                      <input
                        type="time"
                        value={order.scheduledTime}
                        onChange={(event) =>
                          onChangeOrder(order.id, {
                            scheduledTime: event.target.value,
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <GripVertical className="h-3.5 w-3.5" />
                      <span>Execução #{order.order}</span>
                    </div>

                    <div className="font-medium text-slate-600">
                      {order.frequencyLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Nenhuma OS adicionada à rota.
          </div>
        )}
      </div>
    </section>
  );
}