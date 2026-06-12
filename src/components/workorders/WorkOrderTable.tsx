"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkOrderListItem } from "@/app/(private)/workorders/actions";

function normalizeStatus(status?: string | null) {
  return String(status || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
}

function toApiStatus(status?: string | null) {
  if (!status) return "";

  const map: Record<string, string> = {
    WAITING_EXECUTION: "WaitingExecution",
    WaitingExecution: "WaitingExecution",

    IN_ROUTE: "InRoute",
    InRoute: "InRoute",

    PENDING_COMPANY_PRICING: "PendingCompanyPricing",
    PendingCompanyPricing: "PendingCompanyPricing",

    PENDING_CUSTOMER_APPROVAL: "PendingCustomerApproval",
    PendingCustomerApproval: "PendingCustomerApproval",

    DONE: "Finished",
    FINISHED: "Finished",
    Finished: "Finished",

    CANCELED: "Canceled",
    CANCELLED: "Canceled",
    Canceled: "Canceled",

    REJECTED: "Rejected",
    Rejected: "Rejected",

    APPROVED: "WaitingExecution",
    Approved: "WaitingExecution",
  };

  return map[status] || status;
}

function statusLabel(status?: string | null) {
  const normalized = normalizeStatus(status);

  const map: Record<string, string> = {
    waitingexecution: "Aguardando execução",
    inroute: "Em rota",
    pendingcompanypricing: "Pendente de preço",
    pendingcustomerapproval: "Pendente aprovação",
    finished: "Concluída",
    done: "Concluída",
    canceled: "Cancelada",
    cancelled: "Cancelada",
    rejected: "Recusada",
  };

  return map[normalized] ?? status ?? "Status não informado";
}

function statusClass(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "waitingexecution") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "inroute") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (normalized === "pendingcompanypricing") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized === "pendingcustomerapproval") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (normalized === "finished" || normalized === "done") {
    return "border-neutral-300 bg-neutral-100 text-neutral-700";
  }

  if (
    normalized === "canceled" ||
    normalized === "cancelled" ||
    normalized === "rejected"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-neutral-300 bg-neutral-100 text-neutral-700";
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  const value = String(date).slice(0, 10);
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatMoney(value?: number | null) {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function WorkOrderTable({
  initialData,
  initialStatus = "",
  initialScheduledDate = "",
  created = false,
}: {
  initialData: WorkOrderListItem[];
  initialStatus?: string;
  initialScheduledDate?: string;
  created?: boolean;
}) {
  const router = useRouter();

  const [rows, setRows] = React.useState(initialData);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState(toApiStatus(initialStatus));
  const [scheduledDate, setScheduledDate] = React.useState(initialScheduledDate);

  React.useEffect(() => {
    setRows(initialData);
  }, [initialData]);

  React.useEffect(() => {
    setStatus(toApiStatus(initialStatus));
  }, [initialStatus]);

  React.useEffect(() => {
    if (created) {
      toast.success("Ordem de serviço criada com sucesso.");
      router.replace("/workorders", { scroll: false });
    }
  }, [created, router]);

  const hasRemoteFilters = Boolean(status || scheduledDate);
  const hasLocalSearch = Boolean(q.trim());
  const hasAnyFilter = hasRemoteFilters || hasLocalSearch;

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((item) =>
      [
        item.title,
        item.customerName,
        item.description,
        item.status,
        statusLabel(item.status),
        item.address,
        item.scheduledDate,
        formatDate(item.scheduledDate),
        formatMoney(item.totalAmount),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [rows, q]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    const apiStatus = toApiStatus(status);

    if (apiStatus) {
      params.set("status", apiStatus);
    }

    if (scheduledDate) {
      params.set("scheduledDate", scheduledDate);
    }

    router.replace(`/workorders${params.toString() ? `?${params}` : ""}`);
  };

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setScheduledDate("");
    router.replace("/workorders");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_220px_170px_190px]">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Busca local
              </label>

              <div className="relative mt-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Buscar por cliente, título, status ou endereço..."
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Todos</option>
                <option value="WaitingExecution">Aguardando execução</option>
                <option value="InRoute">Em rota</option>
                <option value="PendingCompanyPricing">
                  Pendente de preço
                </option>
                <option value="PendingCustomerApproval">
                  Pendente aprovação
                </option>
                <option value="Finished">Concluída</option>
                <option value="Canceled">Cancelada</option>
                <option value="Rejected">Recusada</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Data agendada
              </label>

              <input
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={applyFilters}
                className="h-10 w-[88px] px-4"
              >
                Aplicar
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                disabled={!hasAnyFilter}
                className={`h-10 w-[88px] px-3 text-slate-500 hover:text-red-600 ${
                  hasAnyFilter
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0"
                }`}
                title="Limpar filtros"
              >
                <X size={16} className="mr-1" />
                Limpar
              </Button>
            </div>
          </div>

          <Button
            className="h-10 btn-brand text-white xl:ml-3"
            onClick={() => router.push("/workorders/new")}
          >
            <Plus size={16} className="mr-2" />
            Nova OS
          </Button>
        </div>

        {hasAnyFilter && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {q.trim() && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                Busca: <strong>{q.trim()}</strong>
              </span>
            )}

            {status && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                Status: <strong>{statusLabel(status)}</strong>
              </span>
            )}

            {scheduledDate && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                Data: <strong>{formatDate(scheduledDate)}</strong>
              </span>
            )}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-md border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left font-semibold text-slate-700">
                  Cliente
                </th>
                <th className="p-3 text-left font-semibold text-slate-700">
                  Título
                </th>
                <th className="p-3 text-left font-semibold text-slate-700">
                  Data
                </th>
                <th className="p-3 text-left font-semibold text-slate-700">
                  Valor
                </th>
                <th className="p-3 text-left font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">
                      {item.customerName}
                    </div>

                    <div className="text-xs text-slate-500">
                      {item.address || "Endereço não informado"}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-800">{item.title}</div>

                    {item.description && (
                      <div className="mt-1 max-w-[420px] truncate text-xs text-slate-500">
                        {item.description}
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-slate-700">
                    {formatDate(item.scheduledDate)}
                  </td>

                  <td className="p-3 text-slate-700">
                    {formatMoney(item.totalAmount)}
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(
                        item.status,
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={5}>
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}