"use client";

import * as React from "react";
import {
  Clock3,
  Hourglass,
  Search,
  Send,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import type { WorkOrderListItem } from "../actions";

import WorkflowWorkOrderCard from "../WorkflowWorkOrderCard";

export default function PendingCustomerApprovalClient({
  initialOrders,
}: {
  initialOrders: WorkOrderListItem[];
}) {
  const [search, setSearch] =
    React.useState("");

  const filteredOrders =
    React.useMemo(() => {
      const normalizedSearch = search
        .trim()
        .toLocaleLowerCase("pt-BR");

      if (!normalizedSearch) {
        return initialOrders;
      }

      return initialOrders.filter(
        (order) => {
          const content = [
            order.title,
            order.customerName,
            order.description,
            order.address,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("pt-BR");

          return content.includes(
            normalizedSearch,
          );
        },
      );
    }, [initialOrders, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Hourglass className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Aguardando cliente
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Acompanhe os orçamentos enviados
              para aprovação. A resposta é feita
              exclusivamente pelo cliente no app.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Send className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Orçamentos enviados
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {initialOrders.length}{" "}
                {initialOrders.length === 1
                  ? "ordem aguarda"
                  : "ordens aguardam"}{" "}
                a decisão do cliente.
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
              placeholder="Buscar por cliente ou serviço..."
              className="h-10 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredOrders.map((order) => (
            <WorkflowWorkOrderCard
              key={order.id}
              order={order}
              badge="Aguardando cliente"
              badgeClassName="border-blue-200 bg-blue-50 text-blue-700"
              action={
                <div className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-center text-xs font-semibold leading-5 text-blue-700">
                  <Clock3 className="h-4 w-4 shrink-0" />

                  Resposta pelo app
                </div>
              }
              footer={
                <div className="flex items-start gap-2 border-t border-blue-100 bg-blue-50/70 px-5 py-3 text-xs leading-5 text-blue-800">
                  <Hourglass className="mt-0.5 h-4 w-4 shrink-0" />

                  O orçamento já foi enviado. A
                  empresa não pode aprovar esta
                  ordem em nome do cliente.
                </div>
              }
            />
          ))}

          {filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <Hourglass className="mx-auto h-9 w-9 text-slate-300" />

              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                Nenhuma resposta pendente
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                Não há orçamentos aguardando
                aprovação do cliente neste
                momento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}