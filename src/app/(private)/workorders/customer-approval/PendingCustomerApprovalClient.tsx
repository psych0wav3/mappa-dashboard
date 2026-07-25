"use client";

import * as React from "react";

import {
  Clock3,
  Hourglass,
} from "lucide-react";

import type {
  WorkOrderListItem,
} from "../actions";

import WorkOrderDataTable from "@/components/workorders/WorkOrderDataTable";

import {
  filterWorkOrders,
} from "@/components/workorders/work-order-table.helpers";

export default function PendingCustomerApprovalClient({
  initialOrders,
}: {
  initialOrders:
    WorkOrderListItem[];
}) {
  const [
    search,
    setSearch,
  ] = React.useState("");

  const filteredOrders =
    React.useMemo(
      () =>
        filterWorkOrders(
          initialOrders,
          search,
        ),
      [
        initialOrders,
        search,
      ],
    );

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Hourglass className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Aguardando Aprovação
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Acompanhe os orçamentos
              enviados para aprovação
              do cliente.
            </p>
          </div>
        </div>
      </header>

      <WorkOrderDataTable
        title="Ordens aguardando aprovação"
        description={`${initialOrders.length} ${
          initialOrders.length === 1
            ? "ordem aguarda"
            : "ordens aguardam"
        } a decisão do cliente.`}
        orders={filteredOrders}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar cliente ou serviço..."
        emptyTitle="Nenhuma aprovação pendente"
        emptyDescription="Não há ordens aguardando aprovação do cliente."
        renderAction={() => (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-700">
            <Clock3 className="h-3.5 w-3.5" />

            Pelo cliente
          </span>
        )}
      />
    </div>
  );
}