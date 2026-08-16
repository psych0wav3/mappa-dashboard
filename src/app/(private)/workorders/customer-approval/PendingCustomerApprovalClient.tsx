"use client";

import * as React from "react";

import {
  Clock3,
  Hourglass,
} from "lucide-react";

import type {
  WorkOrderListItem,
} from "../actions";

import FormPageHeader from "@/components/form-layout/FormPageHeader";
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
    <div className="space-y-5 pb-8">
      <FormPageHeader icon={Hourglass} title="Aguardando Aprovação" description="Acompanhe os orçamentos enviados para aprovação do cliente." />

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