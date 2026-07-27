"use client";

import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  MapPin,
  UserRound,
  Wrench,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import {
  formatWorkOrderDate,
  formatWorkOrderMoney,
  workOrderStatusClassName,
  workOrderStatusDotClassName,
  workOrderStatusLabel,
} from "../work-order-table.helpers";

import {
  type ParsedWorkOrderDescription,
  workOrderDisplayCode,
  workOrderOriginLabel,
} from "./work-order-details.helpers";

type DetailsRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
};

function DetailsRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: DetailsRowProps) {
  return (
    <div className="grid min-h-[48px] grid-cols-[190px_minmax(0,1fr)] items-center border-t border-slate-100 first:border-t-0 max-sm:grid-cols-1 max-sm:gap-1 max-sm:px-4 max-sm:py-3">
      <div className="flex items-center gap-3 px-4 py-3 max-sm:p-0">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>

      <div
        className={[
          "min-w-0 px-4 py-3 text-sm font-medium",
          highlight
            ? "font-bold text-sky-700"
            : "text-slate-800",
          "max-sm:p-0 max-sm:pl-11",
        ].join(" ")}
      >
        <span
          className="block break-words"
          title={value}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export default function WorkOrderDetailsOverview({
  order,
  parsedDescription,
}: {
  order: WorkOrderListItem;
  parsedDescription: ParsedWorkOrderDescription;
}) {
  const orderType =
    parsedDescription.serviceType ||
    "Serviço avulso";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-sky-100 bg-sky-50/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-600 text-white shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {workOrderDisplayCode(order)}
              </span>

              <span
                className={[
                  "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold",
                  workOrderStatusClassName(
                    order.status,
                  ),
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    workOrderStatusDotClassName(
                      order.status,
                    ),
                  ].join(" ")}
                />

                {workOrderStatusLabel(
                  order.status,
                )}
              </span>
            </div>

            <h3
              className="mt-1.5 truncate text-lg font-bold text-slate-950"
              title={order.title}
            >
              {order.title}
            </h3>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Informações da ordem
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Dados principais do atendimento, cliente e local.
          </p>
        </div>

        <div>
          <DetailsRow
            icon={CalendarDays}
            label="Data do serviço"
            value={formatWorkOrderDate(
              order.scheduledDate,
            )}
          />

          <DetailsRow
            icon={Wrench}
            label="Tipo da OS"
            value={orderType}
          />

          <DetailsRow
            icon={UserRound}
            label="Cliente"
            value={
              order.customerName ||
              "Cliente não informado"
            }
          />

          <DetailsRow
            icon={MapPin}
            label="Endereço"
            value={
              order.address ||
              "Endereço não informado"
            }
          />

          <DetailsRow
            icon={UserRound}
            label="Origem da ordem"
            value={workOrderOriginLabel(
              order,
            )}
          />
        </div>
      </section>
    </div>
  );
}