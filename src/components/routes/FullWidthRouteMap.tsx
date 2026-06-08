"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import {
  type PlannedRouteOrder,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

export default function FullWidthRouteMap({
  orders,
  weekLabel,
}: {
  orders: PlannedRouteOrder[];
  weekLabel: string;
}) {
  const uniqueOrders = React.useMemo(() => {
    const map = new Map<string, PlannedRouteOrder>();

    for (const order of orders) {
      map.set(order.plannedId, order);
    }

    return Array.from(map.values());
  }, [orders]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Mapa da semana
            </h2>
            <p className="text-xs text-slate-500">
              Pins de todos os clientes adicionados ao planejamento semanal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {weekLabel}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {uniqueOrders.length} pins
          </span>
        </div>
      </div>

      <div className="relative h-[560px] overflow-hidden bg-[linear-gradient(135deg,#dff8e8_0%,#dff8e8_35%,#d8eefc_35%,#d8eefc_50%,#f4f9ff_50%,#f4f9ff_100%)]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[4%] top-[20%] h-[2px] w-[92%] rotate-6 bg-slate-400" />
          <div className="absolute left-[8%] top-[70%] h-[2px] w-[86%] -rotate-6 bg-slate-400" />
          <div className="absolute left-[22%] top-0 h-full w-[2px] rotate-12 bg-slate-400" />
          <div className="absolute left-[58%] top-0 h-full w-[2px] -rotate-12 bg-slate-400" />
        </div>

        {uniqueOrders.map((order, index) => {
          const positions = [
            { left: "47%", top: "46%" },
            { left: "55%", top: "36%" },
            { left: "39%", top: "58%" },
            { left: "66%", top: "54%" },
            { left: "34%", top: "36%" },
            { left: "51%", top: "68%" },
            { left: "72%", top: "40%" },
            { left: "28%", top: "65%" },
          ];

          const pos = positions[index % positions.length];

          return (
            <div
              key={order.plannedId}
              className="absolute"
              style={{
                left: pos.left,
                top: pos.top,
                transform: "translate(-50%, -50%)",
              }}
              title={order.customerName}
            >
              <div className="group relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-sm font-bold text-white shadow-lg">
                  {index + 1}
                </div>

                <div className="pointer-events-none absolute left-1/2 top-12 z-10 hidden w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg group-hover:block">
                  <div className="font-semibold text-slate-900">
                    {order.customerName}
                  </div>

                  <div className="mt-1 text-slate-600">{order.title}</div>

                  <div className="mt-1 text-slate-500">
                    {weekdaysLabel(order.weekdays)}
                  </div>

                  <div className="mt-1 truncate text-slate-500">
                    {order.address}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {uniqueOrders.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
              Adicione OS ao planejamento para visualizar os pins no mapa.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}