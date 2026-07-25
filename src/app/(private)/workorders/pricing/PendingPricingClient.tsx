"use client";

import * as React from "react";

import {
  Calculator,
  CalendarDays,
  Send,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  priceWorkOrder,
  type WorkOrderListItem,
} from "../actions";

import WorkOrderDataTable from "@/components/workorders/WorkOrderDataTable";

import {
  filterWorkOrders,
} from "@/components/workorders/work-order-table.helpers";

function todayIso() {
  const now = new Date();

  const offset =
    now.getTimezoneOffset();

  return new Date(
    now.getTime() -
      offset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function parseCurrencyInput(
  value: string,
) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatCurrencyInput(
  value: number,
) {
  if (!value) {
    return "";
  }

  return value.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function PricingForm({
  order,
  pending,
  onCancel,
  onSuccess,
}: {
  order: WorkOrderListItem;
  pending: boolean;
  onCancel: () => void;
  onSuccess: (
    order: WorkOrderListItem,
  ) => void;
}) {
  const [
    scheduledDate,
    setScheduledDate,
  ] = React.useState(
    order.scheduledDate?.slice(
      0,
      10,
    ) || todayIso(),
  );

  const [
    amount,
    setAmount,
  ] = React.useState(
    order.totalAmount > 0
      ? formatCurrencyInput(
          order.totalAmount,
        )
      : "",
  );

  const numericAmount =
    parseCurrencyInput(
      amount,
    );

  function handleSubmit() {
    if (!scheduledDate) {
      toast.error(
        "Informe a data prevista.",
      );

      return;
    }

    if (numericAmount <= 0) {
      toast.error(
        "Informe um valor maior que zero.",
      );

      return;
    }

    void priceWorkOrder({
      serviceOrderId:
        order.id,

      scheduledDate,

      totalAmount:
        numericAmount,
    })
      .then((updated) => {
        toast.success(
          "Orçamento enviado ao cliente.",
        );

        onSuccess(updated);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível precificar a ordem.",
        );
      });
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50 p-4 sm:px-6">
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Data prevista
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type="date"
              min={todayIso()}
              value={scheduledDate}
              onChange={(event) =>
                setScheduledDate(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl pl-10"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Valor do orçamento
          </label>

          <div className="flex h-10 overflow-hidden rounded-xl border border-slate-300 bg-white">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              R$
            </span>

            <input
              value={amount}
              inputMode="decimal"
              onChange={(event) =>
                setAmount(
                  event.target.value,
                )
              }
              onBlur={() => {
                if (
                  numericAmount > 0
                ) {
                  setAmount(
                    formatCurrencyInput(
                      numericAmount,
                    ),
                  );
                }
              }}
              className="min-w-0 flex-1 px-3 text-sm outline-none"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="btn-brand h-10 rounded-xl px-4 text-white"
            onClick={handleSubmit}
            disabled={
              pending ||
              !scheduledDate ||
              numericAmount <= 0
            }
          >
            <Send className="mr-2 h-4 w-4" />

            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PendingPricingClient({
  initialOrders,
}: {
  initialOrders:
    WorkOrderListItem[];
}) {
  const [
    pending,
    startTransition,
  ] = React.useTransition();

  const [
    orders,
    setOrders,
  ] = React.useState(
    initialOrders,
  );

  const [
    search,
    setSearch,
  ] = React.useState("");

  const [
    selectedOrderId,
    setSelectedOrderId,
  ] = React.useState<
    string | null
  >(null);

  const filteredOrders =
    React.useMemo(
      () =>
        filterWorkOrders(
          orders,
          search,
        ),
      [
        orders,
        search,
      ],
    );

  function handleSuccess(
    updated:
      WorkOrderListItem,
  ) {
    startTransition(() => {
      setOrders((current) =>
        current.filter(
          (order) =>
            order.id !==
            updated.id,
        ),
      );

      setSelectedOrderId(
        null,
      );
    });
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
              Revise as solicitações,
              informe o valor e envie
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
        expandedOrderId={
          selectedOrderId
        }
        renderAction={(order) => {
          const isSelected =
            selectedOrderId ===
            order.id;

          return (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() =>
                setSelectedOrderId(
                  isSelected
                    ? null
                    : order.id,
                )
              }
              className="btn-brand h-8 rounded-lg px-3 text-xs text-white"
            >
              <Calculator className="mr-1.5 h-3.5 w-3.5" />

              {isSelected
                ? "Fechar"
                : "Precificar"}
            </Button>
          );
        }}
        renderExpandedRow={(
          order,
        ) => (
          <PricingForm
            order={order}
            pending={pending}
            onCancel={() =>
              setSelectedOrderId(
                null,
              )
            }
            onSuccess={
              handleSuccess
            }
          />
        )}
      />
    </div>
  );
}