"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkOrderListItem } from "@/app/(private)/workorders/actions";

function statusLabel(status: string) {
  const map: Record<string, string> = {
    WAITING_EXECUTION: "Aguardando execução",
    IN_ROUTE: "Em rota",
    PENDING_COMPANY_PRICING: "Pendente de preço",
    PENDING_CUSTOMER_APPROVAL: "Pendente aprovação",
    APPROVED: "Aprovada",
    REJECTED: "Recusada",
    DONE: "Concluída",
    CANCELED: "Cancelada",
  };

  return map[status] ?? status;
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
  const [status, setStatus] = React.useState(initialStatus);
  const [scheduledDate, setScheduledDate] = React.useState(initialScheduledDate);

  React.useEffect(() => {
    setRows(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (created) {
      toast.success("Ordem de serviço criada com sucesso.");
      router.replace("/workorders", { scroll: false });
    }
  }, [created, router]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((item) =>
      [
        item.title,
        item.customerName,
        item.description,
        item.status,
        item.address,
        item.scheduledDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [rows, q]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    if (scheduledDate) {
      params.set("scheduledDate", scheduledDate);
    }

    router.replace(`/workorders${params.toString() ? `?${params}` : ""}`);
  };

  const clearFilters = () => {
    setStatus("");
    setScheduledDate("");
    router.replace("/workorders");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px_auto]">
          <div>
            <label className="text-xs font-medium text-neutral-600">
              Busca local
            </label>

            <div className="relative mt-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Buscar por cliente, título, status..."
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">
              Status
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="">Todos</option>
              <option value="WAITING_EXECUTION">Aguardando execução</option>
              <option value="IN_ROUTE">Em rota</option>
              <option value="PENDING_COMPANY_PRICING">
                Pendente de preço
              </option>
              <option value="PENDING_CUSTOMER_APPROVAL">
                Pendente aprovação
              </option>
              <option value="APPROVED">Aprovada</option>
              <option value="DONE">Concluída</option>
              <option value="CANCELED">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">
              Data agendada
            </label>

            <input
              type="date"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={applyFilters}>
              Filtrar
            </Button>

            <Button type="button" variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </div>

        <Button
          className="btn-brand text-white"
          onClick={() => router.push("/workorders/new")}
        >
          <Plus size={16} className="mr-2" />
          Nova OS
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Título</th>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{item.customerName}</div>
                  <div className="text-xs text-neutral-500">
                    {item.address || "—"}
                  </div>
                </td>

                <td className="p-3">
                  <div>{item.title}</div>
                  {item.description && (
                    <div className="mt-1 max-w-[420px] truncate text-xs text-neutral-500">
                      {item.description}
                    </div>
                  )}
                </td>

                <td className="p-3">{formatDate(item.scheduledDate)}</td>
                <td className="p-3">{formatMoney(item.totalAmount)}</td>

                <td className="p-3">
                  <span className="inline-flex rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                    {statusLabel(item.status)}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={5}>
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}