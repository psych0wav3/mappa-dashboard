"use client";

import * as React from "react";
import { CalendarDays, Send } from "lucide-react";
import { toast } from "sonner";

import {
  priceWorkOrder,
  type WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - offset * 60_000,
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

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrencyInput(
  value: number,
) {
  if (!value) {
    return "";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function WorkOrderDetailsPricingForm({
  order,
  onUpdated,
}: {
  order: WorkOrderListItem;
  onUpdated: (updated: WorkOrderListItem) => void;
}) {
  const [pending, startTransition] =
    React.useTransition();

  const [scheduledDate, setScheduledDate] =
    React.useState(
      order.scheduledDate?.slice(0, 10) ||
        todayIso(),
    );

  const [amount, setAmount] = React.useState(
    order.totalAmount > 0
      ? formatCurrencyInput(
          order.totalAmount,
        )
      : "",
  );

  const numericAmount =
    parseCurrencyInput(amount);

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

    startTransition(async () => {
      try {
        const updated =
          await priceWorkOrder({
            serviceOrderId: order.id,
            scheduledDate,
            totalAmount: numericAmount,
          });

        toast.success(
          "Orçamento enviado ao cliente.",
        );

        onUpdated(updated);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível precificar a ordem.",
        );
      }
    });
  }

  return (
    <section
      id="work-order-pricing-form"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
    >
      <h3 className="text-sm font-semibold text-amber-900">
        Precificação da ordem
      </h3>

      <p className="mt-1 text-sm leading-6 text-amber-800">
        Esta ordem aguarda precificação. Informe a data prevista e o valor para enviar o orçamento ao cliente.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
              className="h-11 rounded-xl bg-white pl-10"
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Valor do orçamento
          </label>

          <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              R$
            </span>

            <input
              value={amount}
              inputMode="decimal"
              onChange={(event) =>
                setAmount(event.target.value)
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
              className="min-w-0 flex-1 px-3 text-sm outline-none"
              placeholder="0,00"
              disabled={pending}
            />
          </div>
        </div>

        <Button
          type="button"
          className="btn-brand h-11 whitespace-nowrap rounded-xl px-5 text-white"
          onClick={handleSubmit}
          disabled={
            pending ||
            !scheduledDate ||
            numericAmount <= 0
          }
        >
          <Send className="mr-2 h-4 w-4 shrink-0" />

          {pending
            ? "Enviando..."
            : "Enviar orçamento"}
        </Button>
      </div>
    </section>
  );
}