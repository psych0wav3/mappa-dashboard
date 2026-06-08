"use client";

import * as React from "react";
import { Clock, MapPin, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type PlannedRouteOrder,
  type RouteWeekday,
  serviceKindLabel,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

function shortAddress(address: string) {
  return address
    .replace(" - Itamambuca - Ubatuba/SP", "")
    .replace(" - Ubatuba/SP", "")
    .replace("Ubatuba/SP", "")
    .trim();
}

function compactTitle(order: PlannedRouteOrder) {
  if (order.serviceKind === "POOL_CLEANING") {
    return order.frequencyLabel;
  }

  return order.title;
}

function WorkOrderDetailsModal({
  order,
  onClose,
  onRemove,
}: {
  order: PlannedRouteOrder;
  onClose: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {order.customerName}
            </h3>

            <p className="mt-0.5 text-sm text-slate-500">
              Detalhes da ordem no planejamento semanal
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium text-slate-500">Tipo</div>
              <div className="mt-1 font-semibold text-slate-800">
                {serviceKindLabel(order.serviceKind)}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium text-slate-500">
                Frequência
              </div>
              <div className="mt-1 font-semibold text-slate-800">
                {order.frequencyLabel}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">Serviço</div>
            <div className="mt-1 font-semibold text-slate-800">
              {order.title}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">
              Dias da semana
            </div>
            <div className="mt-1 font-semibold text-slate-800">
              {weekdaysLabel(order.weekdays)}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">
              Horário previsto
            </div>
            <div className="mt-1 font-semibold text-slate-800">
              {order.scheduledTime}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">Endereço</div>
            <div className="mt-1 font-semibold text-slate-800">
              {order.address}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={onRemove}
          >
            Remover da rota
          </Button>

          <Button type="button" className="btn-brand text-white" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WeekdayColumn({
  day,
  slot,
  orders,
  onRemoveOrder,
  onUpdateOrder,
}: {
  day: RouteWeekday;
  slot: string;
  orders: PlannedRouteOrder[];
  onRemoveOrder: (plannedId: string) => void;
  onUpdateOrder: (
    plannedId: string,
    patch: Partial<Pick<PlannedRouteOrder, "scheduledTime" | "weekdays">>,
  ) => void;
}) {
  const [openOrder, setOpenOrder] = React.useState<PlannedRouteOrder | null>(
    null,
  );

  return (
    <div className="border-r border-slate-200 bg-slate-50/40 p-1.5 last:border-r-0">
      <div className="flex min-h-[112px] flex-col gap-1.5">
        {orders.map((order) => (
          <div
            key={`${day}-${slot}-${order.plannedId}`}
            className="group relative w-full rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50/40"
            title={`${order.customerName}
${serviceKindLabel(order.serviceKind)}
${order.frequencyLabel} — ${weekdaysLabel(order.weekdays)}
${order.scheduledTime}
${order.address}`}
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setOpenOrder(order)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-[12px] font-bold leading-4 text-slate-900">
                  {order.customerName}
                </div>

                <div className="mt-0.5 truncate text-[11px] font-medium leading-4 text-sky-700">
                  {compactTitle(order)}
                </div>
              </button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6 shrink-0 rounded-md border-red-200 p-0 text-red-600 hover:bg-red-50"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveOrder(order.plannedId);
                }}
                title="Remover OS da semana"
              >
                <Trash2 size={11} />
              </Button>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] leading-4 text-slate-600">
                <Clock className="h-3 w-3 shrink-0 text-slate-400" />

                <input
                  type="time"
                  value={order.scheduledTime}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    onUpdateOrder(order.plannedId, {
                      scheduledTime: event.target.value,
                    })
                  }
                  className="h-6 w-[78px] rounded-md border border-slate-300 bg-white px-1.5 text-[11px] outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setOpenOrder(order)}
                className="flex min-w-0 items-start gap-1.5 text-left text-[11px] leading-4 text-slate-500 hover:text-slate-700"
              >
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />

                <span className="line-clamp-2">
                  {shortAddress(order.address)}
                </span>
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {serviceKindLabel(order.serviceKind)}
              </span>

              <button
                type="button"
                onClick={() => setOpenOrder(order)}
                className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
              >
                ver
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="flex min-h-[112px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/60 px-2 text-center text-[10px] text-slate-400">
            vazio
          </div>
        )}
      </div>

      {openOrder && (
        <WorkOrderDetailsModal
          order={openOrder}
          onClose={() => setOpenOrder(null)}
          onRemove={() => {
            onRemoveOrder(openOrder.plannedId);
            setOpenOrder(null);
          }}
        />
      )}
    </div>
  );
}