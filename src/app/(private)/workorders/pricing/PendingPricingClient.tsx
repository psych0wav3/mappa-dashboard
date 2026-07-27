"use client";

import * as React from "react";
import { Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import WorkOrderDataTable from "@/components/workorders/WorkOrderDataTable";
import { filterWorkOrders } from "@/components/workorders/work-order-table.helpers";

import type { WorkOrderListItem } from "../actions";
import WorkOrderPricingModal from "./WorkOrderPricingModal";

export default function PendingPricingClient({
  initialOrders,
}: {
  initialOrders: WorkOrderListItem[];
}) {
  const [orders, setOrders] =
    React.useState(initialOrders);

  const [search, setSearch] =
    React.useState("");

  const [selectedOrder, setSelectedOrder] =
    React.useState<WorkOrderListItem | null>(
      null,
    );

  const filteredOrders = React.useMemo(
    () =>
      filterWorkOrders(
        orders,
        search,
      ),
    [orders, search],
  );

  function handleSuccess(
    serviceOrderId: string,
  ) {
    setOrders((current) =>
      current.filter(
        (order) =>
          order.id !== serviceOrderId,
      ),
    );

    setSelectedOrder(null);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Calculator className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Aguardando Precificação
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Revise as solicitações, detalhe
              os itens e envie o orçamento
              ao cliente.
            </p>
          </div>
        </div>
      </header>

      <WorkOrderDataTable
        title="Solicitações aguardando preço"
        description={`${orders.length} ${
          orders.length === 1
            ? "ordem precisa"
            : "ordens precisam"
        } de precificação.`}
        orders={filteredOrders}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar cliente, serviço ou técnico..."
        emptyTitle="Nenhuma ordem aguardando precificação"
        emptyDescription="Não existem solicitações pendentes de preço."
        renderAction={(order) => (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              setSelectedOrder(order)
            }
            className="btn-brand h-8 rounded-lg px-3 text-xs text-white"
          >
            <Calculator className="mr-1.5 h-3.5 w-3.5" />

            Precificar
          </Button>
        )}
      />

      <WorkOrderPricingModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
          }
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}