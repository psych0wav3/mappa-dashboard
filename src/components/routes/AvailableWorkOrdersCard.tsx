"use client";

import * as React from "react";
import { CalendarDays, Clock, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type AvailableWorkOrder,
  serviceKindLabel,
  statusLabel,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

export default function AvailableWorkOrdersCard({
  orders,
  onAddOrder,
}: {
  orders: AvailableWorkOrder[];
  onAddOrder: (order: AvailableWorkOrder) => void;
}) {
  return (
    <div className="h-[255px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="h-full space-y-1.5 overflow-y-auto p-2.5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-sky-200 hover:bg-sky-50/30"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(210px,280px)_1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {order.customerName}
                  </h3>

                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-1">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {serviceKindLabel(order.serviceKind)}
                  </span>
                </div>
              </div>

              <div className="min-w-0 space-y-1 text-[11px] text-slate-500">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {order.frequencyLabel} — {weekdaysLabel(order.weekdays)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{order.scheduledTime}</span>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{order.address}</span>
                </div>
              </div>

              <div className="flex shrink-0 justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs btn-brand text-white"
                  onClick={() => onAddOrder(order)}
                >
                  <Plus size={13} className="mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Nenhuma OS disponível encontrada.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}