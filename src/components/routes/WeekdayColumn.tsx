"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Clock,
  MapPin,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type PlannedRouteOrder,
  type RouteWeekday,
  serviceKindLabel,
} from "@/components/routes/routeBuilderMockTypes";

export default function WeekdayColumn({
  day,
  slot,
  orders,
  onRemoveOrder,
  onUpdateOrder,
  onMoveOrder,
}: {
  day: RouteWeekday;
  slot: string;
  orders: PlannedRouteOrder[];
  onRemoveOrder: (plannedId: string) => void;
  onUpdateOrder: (
    plannedId: string,
    patch: Partial<Pick<PlannedRouteOrder, "scheduledTime" | "weekdays">>,
  ) => void;
  onMoveOrder: (plannedId: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="border-r border-slate-200 bg-slate-50/40 p-2 last:border-r-0">
      <div className="flex min-h-[150px] flex-col gap-2">
        {orders.map((order) => (
          <div
            key={`${day}-${slot}-${order.plannedId}`}
            className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/20"
          >
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-slate-900">
                  {order.customerName}
                </div>

                <div className="mt-0.5 truncate text-[11px] text-slate-600">
                  {order.title}
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6 shrink-0 border-red-200 p-0 text-red-600 hover:bg-red-50"
                onClick={() => onRemoveOrder(order.plannedId)}
                title="Remover OS da semana"
              >
                <Trash2 size={12} />
              </Button>
            </div>

            <div className="mt-2 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span className="truncate">{order.frequencyLabel}</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{order.address}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <input
                  type="time"
                  value={order.scheduledTime}
                  onChange={(event) =>
                    onUpdateOrder(order.plannedId, {
                      scheduledTime: event.target.value,
                    })
                  }
                  className="h-7 w-full rounded-md border border-slate-300 bg-white px-1.5 text-[11px] outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="truncate rounded-md bg-slate-50 px-1.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                {serviceKindLabel(order.serviceKind)}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => onMoveOrder(order.plannedId, "up")}
                  title="Subir"
                >
                  <ArrowUp size={12} />
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => onMoveOrder(order.plannedId, "down")}
                  title="Descer"
                >
                  <ArrowDown size={12} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/60 px-2 text-center text-[11px] text-slate-400">
            vazio
          </div>
        )}
      </div>
    </div>
  );
}