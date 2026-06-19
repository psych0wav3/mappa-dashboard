"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  UserRound,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type AvailableWorkOrder,
  serviceKindLabel,
  statusLabel,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

type AvailableWorkOrderWithMetadata = AvailableWorkOrder & {
  scheduledDate?: string | null;
  weekdaysLabel?: string | null;
  totalAmount?: number | null;
  technicianId?: string | null;
  technicianName?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Data não informada";

  const date = String(value).slice(0, 10);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatMoney(value?: number | null) {
  const number = Number(value || 0);

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getWeekdaysText(order: AvailableWorkOrderWithMetadata) {
  if (order.weekdaysLabel && order.weekdaysLabel.trim()) {
    return order.weekdaysLabel;
  }

  return weekdaysLabel(order.weekdays);
}

function getTimeText(order: AvailableWorkOrderWithMetadata) {
  if (!order.scheduledTime) {
    return "Horário não informado";
  }

  return order.scheduledTime;
}

export default function AvailableWorkOrdersCard({
  orders,
  onAddOrder,
}: {
  orders: AvailableWorkOrderWithMetadata[];
  onAddOrder: (order: AvailableWorkOrderWithMetadata) => void;
}) {
  return (
    <div className="h-[300px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="h-full space-y-2 overflow-y-auto p-2.5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-sky-200 hover:bg-sky-50/30"
          >
            <div className="grid gap-3 xl:grid-cols-[minmax(220px,300px)_1fr_auto] xl:items-center">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {order.customerName}
                  </h3>

                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {serviceKindLabel(order.serviceKind)}
                  </span>

                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {order.frequencyLabel}
                  </span>
                </div>

                <div className="mt-1 truncate text-xs text-slate-600">
                  {order.title}
                </div>
              </div>

              <div className="min-w-0 space-y-1.5 text-[11px] text-slate-500">
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">
                      {formatDate(order.scheduledDate)}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">{getTimeText(order)}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">{getWeekdaysText(order)}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">
                      {formatMoney(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">{order.address}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">
                      {order.technicianName || "Técnico não informado"}
                    </span>
                  </div>
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