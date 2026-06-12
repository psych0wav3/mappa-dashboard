"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkOrderListItem } from "../actions";

function normalizeStatus(status?: string | null) {
  return String(status || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
}

function isApprovedWorkOrder(status?: string | null) {
  const normalized = normalizeStatus(status);

  return [
    "waitingexecution",
    "approved",
    "customerapproved",
    "customerapprovalapproved",
  ].includes(normalized);
}

function statusLabel(status?: string | null) {
  const normalized = normalizeStatus(status);

  const map: Record<string, string> = {
    waitingexecution: "Aprovada",
    approved: "Aprovada",
    customerapproved: "Cliente aprovou",
    customerapprovalapproved: "Cliente aprovou",
    inroute: "Em rota",
    pendingcompanypricing: "Aguardando precificação",
    pendingcustomerapproval: "Aguardando aceite",
    finished: "Finalizada",
    canceled: "Cancelada",
    rejected: "Recusada",
  };

  return map[normalized] || status || "Status não informado";
}

function statusStyle(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "waitingexecution" ||
    normalized === "approved" ||
    normalized === "customerapproved" ||
    normalized === "customerapprovalapproved"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "inroute") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";

  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatMoney(value?: number | null) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getPreviewDescription(description?: string | null) {
  const clean = String(description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("-----"))
    .filter((line) => !line.startsWith("Observação técnica:"));

  return clean[0] || "Sem observações.";
}

function getTechnicianFromDescription(description?: string | null) {
  const line = String(description || "")
    .split("\n")
    .find((item) =>
      item.toLowerCase().startsWith("técnico responsável:"),
    );

  if (!line) return "Técnico não informado";

  return line.replace("Técnico responsável:", "").trim() || "Técnico não informado";
}

function getTimeFromDescription(description?: string | null) {
  const line = String(description || "")
    .split("\n")
    .find((item) => item.toLowerCase().startsWith("horário previsto:"));

  if (!line) return "Horário não informado";

  return line.replace("Horário previsto:", "").trim() || "Horário não informado";
}

export default function ApprovedWorkOrdersClient({
  initialData,
}: {
  initialData: WorkOrderListItem[];
}) {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const approvedOrders = React.useMemo(
    () => initialData.filter((order) => isApprovedWorkOrder(order.status)),
    [initialData],
  );

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return approvedOrders;

    return approvedOrders.filter((order) =>
      [
        order.customerName,
        order.title,
        order.address,
        order.status,
        order.description,
        formatDate(order.scheduledDate),
        formatMoney(order.totalAmount),
        getTechnicianFromDescription(order.description),
        getTimeFromDescription(order.description),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [approvedOrders, q]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      const dateCompare = String(a.scheduledDate || "").localeCompare(
        String(b.scheduledDate || ""),
      );

      if (dateCompare !== 0) return dateCompare;

      return a.customerName.localeCompare(b.customerName, "pt-BR");
    });

    return copy;
  }, [filtered]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

            <h2 className="text-sm font-semibold text-slate-900">
              Ordens aprovadas para rota
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Estas OS já estão liberadas para entrar no planejamento de rotas.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar por cliente, título, endereço ou técnico..."
              className="h-10 pl-9"
            />
          </div>

          <Button
            type="button"
            className="btn-brand text-white"
            onClick={() => router.push("/routes/builder")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar rota
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600">
          {approvedOrders.length} aprovada{approvedOrders.length === 1 ? "" : "s"}
        </span>

        {q.trim() && (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-medium text-sky-700">
            {sorted.length} resultado{sorted.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />

          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            Nenhuma OS aprovada encontrada
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Quando o cliente aprovar uma OS, ela aparecerá aqui pronta para ser
            adicionada a uma rota.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((order) => {
            const technicianName = getTechnicianFromDescription(
              order.description,
            );
            const scheduledTime = getTimeFromDescription(order.description);

            return (
              <article
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-sky-200 hover:bg-sky-50/20"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {order.customerName}
                      </h3>

                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle(
                          order.status,
                        )}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <div className="mt-1 text-sm font-medium text-slate-700">
                      {order.title}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {getPreviewDescription(order.description)}
                    </p>

                    <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-600 md:grid-cols-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                        <span className="truncate">
                          {formatDate(order.scheduledDate)} às {scheduledTime}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                        <span className="truncate">{technicianName}</span>
                      </div>

                      <div
                        className="flex min-w-0 items-center gap-1.5 md:col-span-2"
                        title={order.address}
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />

                        <span className="truncate">
                          {order.address || "Endereço não informado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                    <div className="text-sm font-bold text-slate-900">
                      {formatMoney(order.totalAmount)}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/routes/builder")}
                    >
                      Adicionar à rota
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}