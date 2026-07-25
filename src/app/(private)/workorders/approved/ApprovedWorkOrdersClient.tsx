"use client";

import * as React from "react";

import {
  Plus,
  Route,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";

import type {
  WorkOrderListItem,
} from "../actions";

import WorkOrderDataTable from "@/components/workorders/WorkOrderDataTable";

import {
  filterWorkOrders,
} from "@/components/workorders/work-order-table.helpers";

export default function ApprovedWorkOrdersClient({
  initialData,
}: {
  initialData:
    WorkOrderListItem[];
}) {
  const router =
    useRouter();

  const [
    search,
    setSearch,
  ] = React.useState("");

  const filteredOrders =
    React.useMemo(
      () =>
        filterWorkOrders(
          initialData,
          search,
        ),
      [
        initialData,
        search,
      ],
    );

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Route className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Prontas para Rota
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Ordens liberadas para
              planejamento e inclusão
              em uma rota.
            </p>
          </div>
        </div>
      </header>

      <WorkOrderDataTable
        title="Ordens liberadas"
        description={`${initialData.length} ${
          initialData.length === 1
            ? "ordem pronta"
            : "ordens prontas"
        } para roteirização.`}
        orders={filteredOrders}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar cliente, serviço ou endereço..."
        emptyTitle="Nenhuma ordem pronta para rota"
        emptyDescription="As ordens aprovadas aparecerão aqui."
        headerAction={
          <Button
            type="button"
            className="btn-brand h-10 rounded-xl px-4 text-white"
            onClick={() =>
              router.push(
                "/routes/builder",
              )
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            Abrir planejador
          </Button>
        }
        renderAction={(order) => {
          const hasAddress =
            Boolean(
              order.customerAddressId,
            );

          return (
            <Button
              type="button"
              size="sm"
              disabled={!hasAddress}
              onClick={() =>
                router.push(
                  "/routes/builder",
                )
              }
              className="btn-brand h-8 rounded-lg px-3 text-xs text-white"
              title={
                hasAddress
                  ? "Adicionar à rota"
                  : "OS sem endereço válido"
              }
            >
              <Route className="mr-1.5 h-3.5 w-3.5" />

              Adicionar
            </Button>
          );
        }}
      />
    </div>
  );
}