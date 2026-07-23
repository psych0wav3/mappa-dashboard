"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  MapPin,
  Plus,
  Route,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { WorkOrderListItem } from "../actions";
import WorkflowWorkOrderCard from "../WorkflowWorkOrderCard";

export default function ApprovedWorkOrdersClient({
  initialData,
}: {
  initialData: WorkOrderListItem[];
}) {
  const router = useRouter();

  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = query
      .trim()
      .toLocaleLowerCase("pt-BR");

    if (!term) {
      return initialData;
    }

    return initialData.filter((order) =>
      [
        order.customerName,
        order.title,
        order.description,
        order.address,
      ].some((value) =>
        String(value || "")
          .toLocaleLowerCase("pt-BR")
          .includes(term),
      ),
    );
  }, [initialData, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Route className="h-4 w-4" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Prontas para rota
              </h1>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ordens liberadas para planejamento e
                inclusão em uma rota de atendimento.
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="btn-brand rounded-xl px-5 text-white"
            onClick={() =>
              router.push("/routes/builder")
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            Abrir planejador
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Ordens liberadas
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {initialData.length}{" "}
              {initialData.length === 1
                ? "ordem pronta"
                : "ordens prontas"}{" "}
              para roteirização.
            </p>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Buscar cliente, serviço ou endereço..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map((order) => {
            const hasAddress = Boolean(
              order.customerAddressId,
            );

            return (
              <WorkflowWorkOrderCard
                key={order.id}
                order={order}
                badge="Pronta para rota"
                badgeClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
                showApprovalDate={Boolean(
                  order.customerApprovedAt,
                )}
                footer={
                  !hasAddress ? (
                    <div className="flex items-start gap-2 border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-800">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                      Esta OS não possui endereço
                      vinculado e não pode ser
                      roteirizada ainda.
                    </div>
                  ) : order.customerApprovedAt ? (
                    <div className="flex items-start gap-2 border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-xs leading-5 text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                      Orçamento aprovado pelo cliente e
                      liberado para execução.
                    </div>
                  ) : null
                }
                action={
                  <Button
                    type="button"
                    className="btn-brand h-10 w-full rounded-xl text-white"
                    onClick={() =>
                      router.push(
                        "/routes/builder",
                      )
                    }
                    disabled={!hasAddress}
                    title={
                      hasAddress
                        ? "Adicionar esta ordem a uma rota"
                        : "Cadastre um endereço antes de roteirizar"
                    }
                  >
                    <Route className="mr-2 h-4 w-4" />

                    Adicionar à rota
                  </Button>
                }
              />
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <Check className="mx-auto h-8 w-8 text-emerald-500" />

              <div className="mt-3 text-sm font-semibold text-slate-700">
                Nenhuma ordem pronta para rota
              </div>

              <p className="mt-1 text-xs text-slate-400">
                As ordens aprovadas pelo cliente ou
                geradas por planos recorrentes
                aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}