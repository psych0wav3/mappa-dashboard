"use client";

import * as React from "react";

import {
  Eye,
  Plus,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import WorkOrderDataTable from "./WorkOrderDataTable";

import {
  filterWorkOrders,
  normalizeWorkOrderStatus,
} from "./work-order-table.helpers";

type WorkOrderTableProps = {
  initialData?: WorkOrderListItem[];
  initialStatus?: string;
  initialScheduledDate?: string;
  created?: boolean;
};

export default function WorkOrderTable({
  initialData = [],
  initialStatus = "",
  initialScheduledDate = "",
  created = false,
}: WorkOrderTableProps) {
  const router =
    useRouter();

  const [
    rows,
    setRows,
  ] = React.useState<
    WorkOrderListItem[]
  >(
    Array.isArray(initialData)
      ? initialData
      : [],
  );

  const [
    search,
    setSearch,
  ] = React.useState("");

  React.useEffect(() => {
    setRows(
      Array.isArray(initialData)
        ? initialData
        : [],
    );
  }, [initialData]);

  React.useEffect(() => {
    if (!created) {
      return;
    }

    toast.success(
      "Ordem de serviço criada com sucesso.",
    );

    router.replace(
      "/workorders",
      {
        scroll: false,
      },
    );
  }, [
    created,
    router,
  ]);

  const filteredRows =
    React.useMemo(() => {
      let result =
        filterWorkOrders(
          rows,
          search,
        );

      if (
        initialStatus.trim()
      ) {
        const expectedStatus =
          normalizeWorkOrderStatus(
            initialStatus,
          );

        result = result.filter(
          (order) =>
            normalizeWorkOrderStatus(
              order.status,
            ) === expectedStatus,
        );
      }

      if (
        initialScheduledDate
          .trim()
      ) {
        result = result.filter(
          (order) =>
            order.scheduledDate
              ?.slice(0, 10) ===
            initialScheduledDate,
        );
      }

      return result;
    }, [
      initialScheduledDate,
      initialStatus,
      rows,
      search,
    ]);

  function handleOpenDetails(
    order: WorkOrderListItem,
  ) {
    router.push(
      `/workorders/${order.id}`,
    );
  }

  return (
    <WorkOrderDataTable
      title="Todas as Ordens de Serviço"
      description={`${filteredRows.length} ${
        filteredRows.length === 1
          ? "ordem encontrada"
          : "ordens encontradas"
      }.`}
      orders={filteredRows}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar cliente, título, status ou endereço..."
      emptyTitle="Nenhuma ordem encontrada"
      emptyDescription="Não existem ordens correspondentes aos filtros ou à pesquisa atual."
      headerAction={
        <Button
          type="button"
          className="btn-brand h-10 rounded-xl px-4 text-white"
          onClick={() =>
            router.push(
              "/workorders/new",
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Nova OS
        </Button>
      }
      renderAction={(
        order,
      ) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs"
          onClick={() =>
            handleOpenDetails(
              order,
            )
          }
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />

          Detalhes
        </Button>
      )}
    />
  );
}