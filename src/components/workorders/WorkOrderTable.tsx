"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import { Button } from "@/components/ui/button";

import WorkOrderDataTable from "./WorkOrderDataTable";
import WorkOrderDetailsModal from "./details/WorkOrderDetailsModal";

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

function scheduledDateTimestamp(
  order: WorkOrderListItem,
) {
  const scheduledDate =
    order.scheduledDate?.slice(0, 10);

  if (!scheduledDate) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(
    `${scheduledDate}T00:00:00`,
  ).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : Number.POSITIVE_INFINITY;
}

function sortWorkOrdersByScheduledDate(
  orders: WorkOrderListItem[],
) {
  return [...orders].sort(
    (firstOrder, secondOrder) => {
      const dateDifference =
        scheduledDateTimestamp(firstOrder) -
        scheduledDateTimestamp(secondOrder);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return firstOrder.title.localeCompare(
        secondOrder.title,
        "pt-BR",
        {
          sensitivity: "base",
        },
      );
    },
  );
}

export default function WorkOrderTable({
  initialData = [],
  initialStatus = "",
  initialScheduledDate = "",
  created = false,
}: WorkOrderTableProps) {
  const router = useRouter();

  const [rows, setRows] = React.useState<
    WorkOrderListItem[]
  >(
    Array.isArray(initialData)
      ? initialData
      : [],
  );

  const [search, setSearch] =
    React.useState("");

  const [detailsOpen, setDetailsOpen] =
    React.useState(false);

  const [selectedOrder, setSelectedOrder] =
    React.useState<WorkOrderListItem | null>(
      null,
    );

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

    router.replace("/workorders", {
      scroll: false,
    });
  }, [created, router]);

  const filteredRows =
    React.useMemo<WorkOrderListItem[]>(() => {
      let result: WorkOrderListItem[] =
        filterWorkOrders(
          rows,
          search,
        );

      if (initialStatus.trim()) {
        const expectedStatus =
          normalizeWorkOrderStatus(
            initialStatus,
          );

        result = result.filter(
          (
            order: WorkOrderListItem,
          ) =>
            normalizeWorkOrderStatus(
              order.status,
            ) === expectedStatus,
        );
      }

      if (
        initialScheduledDate.trim()
      ) {
        result = result.filter(
          (
            order: WorkOrderListItem,
          ) =>
            order.scheduledDate?.slice(
              0,
              10,
            ) ===
            initialScheduledDate,
        );
      }

      return sortWorkOrdersByScheduledDate(
        result,
      );
    }, [
      initialScheduledDate,
      initialStatus,
      rows,
      search,
    ]);

  function handleOpenDetails(
    order: WorkOrderListItem,
  ) {
    setSelectedOrder(order);
    setDetailsOpen(true);
  }

  function handleDetailsOpenChange(
    open: boolean,
  ) {
    setDetailsOpen(open);

    if (!open) {
      window.setTimeout(() => {
        setSelectedOrder(null);
      }, 150);
    }
  }

  function handleOrderUpdated(
    updated: WorkOrderListItem,
  ) {
    setRows((current) =>
      current.map((order) =>
        order.id === updated.id
          ? {
              ...order,
              ...updated,
            }
          : order,
      ),
    );

    setSelectedOrder(updated);
  }

  return (
    <>
      <WorkOrderDataTable
        orders={filteredRows}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar cliente, serviço ou status..."
        resultLabel={`${filteredRows.length} ${
          filteredRows.length === 1
            ? "ordem encontrada"
            : "ordens encontradas"
        }`}
        emptyTitle="Nenhuma ordem encontrada"
        emptyDescription="Não existem ordens correspondentes aos filtros ou à pesquisa atual."
        renderAction={(
          order: WorkOrderListItem,
        ) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 whitespace-nowrap rounded-lg px-3 text-xs"
            onClick={() =>
              handleOpenDetails(order)
            }
          >
            <Eye className="mr-1.5 h-3.5 w-3.5 shrink-0" />

            Detalhes
          </Button>
        )}
      />

      <WorkOrderDetailsModal
        open={detailsOpen}
        orderId={
          selectedOrder?.id || null
        }
        initialOrder={selectedOrder}
        onOpenChange={
          handleDetailsOpenChange
        }
        onOrderUpdated={
          handleOrderUpdated
        }
      />
    </>
  );
}