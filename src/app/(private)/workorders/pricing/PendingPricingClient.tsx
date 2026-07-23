"use client";

import * as React from "react";
import {
  Calculator,
  CalendarDays,
  CheckCircle2,
  Search,
  Send,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  priceWorkOrder,
  type WorkOrderListItem,
} from "../actions";

import WorkflowWorkOrderCard from "../WorkflowWorkOrderCard";

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - offset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function parseCurrencyInput(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrencyInput(value: number) {
  if (!value) {
    return "";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
  onSuccess: (order: WorkOrderListItem) => void;
}) {
  const [scheduledDate, setScheduledDate] =
    React.useState(
      order.scheduledDate?.slice(0, 10) ||
        todayIso(),
    );

  const [amount, setAmount] =
    React.useState(
      order.totalAmount > 0
        ? formatCurrencyInput(
            order.totalAmount,
          )
        : "",
    );

  const numericAmount =
    parseCurrencyInput(amount);

  const isValid =
    Boolean(scheduledDate) &&
    numericAmount > 0;

  function handleSubmit() {
    if (!scheduledDate) {
      toast.error(
        "Informe a data prevista do serviço.",
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
      serviceOrderId: order.id,
      scheduledDate,
      totalAmount: numericAmount,
    })
      .then((updated) => {
        toast.success(
          "Orçamento enviado para aprovação do cliente.",
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
    <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <Calculator className="h-4 w-4" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Revisar e precificar
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Defina a data prevista e o valor
              total antes de enviar a ordem para
              aprovação do cliente.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Data prevista
              <span className="ml-1 text-red-500">
                *
              </span>
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
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Valor total do orçamento
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
              <div className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                R$
              </div>

              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value,
                  )
                }
                onBlur={() => {
                  if (numericAmount > 0) {
                    setAmount(
                      formatCurrencyInput(
                        numericAmount,
                      ),
                    );
                  }
                }}
                placeholder="0,00"
                className="min-w-0 flex-1 bg-white px-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="btn-brand rounded-xl px-5 text-white"
            onClick={handleSubmit}
            disabled={
              pending || !isValid
            }
          >
            <Send className="mr-2 h-4 w-4" />

            {pending
              ? "Enviando..."
              : "Enviar ao cliente"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PendingPricingClient({
  initialOrders,
}: {
  initialOrders: WorkOrderListItem[];
}) {
  const [pending, startTransition] =
    React.useTransition();

  const [orders, setOrders] =
    React.useState(initialOrders);

  const [search, setSearch] =
    React.useState("");

  const [selectedOrderId, setSelectedOrderId] =
    React.useState<string | null>(null);

  const filteredOrders =
    React.useMemo(() => {
      const normalizedSearch = search
        .trim()
        .toLocaleLowerCase("pt-BR");

      if (!normalizedSearch) {
        return orders;
      }

      return orders.filter((order) => {
        const content = [
          order.title,
          order.customerName,
          order.description,
          order.address,
          order.openedByUserName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return content.includes(
          normalizedSearch,
        );
      });
    }, [orders, search]);

  function handlePricingSuccess(
    updated: WorkOrderListItem,
  ) {
    startTransition(() => {
      setOrders((current) =>
        current.filter(
          (order) =>
            order.id !== updated.id,
        ),
      );

      setSelectedOrderId(null);
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
              Aguardando orçamento
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Revise as solicitações abertas
              pelos técnicos, informe o valor e
              envie o orçamento para aprovação
              do cliente.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Wrench className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Solicitações dos técnicos
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {orders.length}{" "}
                {orders.length === 1
                  ? "ordem precisa"
                  : "ordens precisam"}{" "}
                de revisão e preço.
              </p>
            </div>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar por cliente, serviço ou técnico..."
              className="h-10 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredOrders.map((order) => {
            const isSelected =
              selectedOrderId === order.id;

            return (
              <div key={order.id}>
                <WorkflowWorkOrderCard
                  order={order}
                  badge="Aguardando orçamento"
                  badgeClassName="border-amber-200 bg-amber-50 text-amber-700"
                  action={
                    <Button
                      type="button"
                      className="btn-brand h-10 w-full rounded-xl text-white"
                      onClick={() =>
                        setSelectedOrderId(
                          isSelected
                            ? null
                            : order.id,
                        )
                      }
                      disabled={pending}
                    >
                      <Calculator className="mr-2 h-4 w-4" />

                      {isSelected
                        ? "Fechar orçamento"
                        : "Revisar e precificar"}
                    </Button>
                  }
                  footer={
                    <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-800">
                      Esta solicitação foi registrada
                      pelo técnico e ainda não foi
                      enviada ao cliente.
                    </div>
                  }
                />

                {isSelected && (
                  <PricingForm
                    order={order}
                    pending={pending}
                    onCancel={() =>
                      setSelectedOrderId(
                        null,
                      )
                    }
                    onSuccess={
                      handlePricingSuccess
                    }
                  />
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-400" />

              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                Nenhum orçamento pendente
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                Todas as solicitações dos
                técnicos já foram revisadas e
                precificadas.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}