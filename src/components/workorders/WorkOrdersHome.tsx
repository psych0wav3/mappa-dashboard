"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

// mesmo tipo exportado nas actions
export type WorkOrderDTO = {
  id: string;
  code: string;
  title: string;
  clientName: string;
  status: "aberta" | "em_andamento" | "concluida" | "cancelada";
  scheduledAt?: string | null;
};

function statusBadge(s: WorkOrderDTO["status"]) {
  const map = {
    aberta: "bg-amber-500",
    em_andamento: "bg-blue-600",
    concluida: "bg-emerald-600",
    cancelada: "bg-neutral-500",
  } as const;
  return <Badge className={`${map[s]} text-white`}>{s.replace("_", " ")}</Badge>;
}

export default function WorkOrdersHome({
  initialData = [],
}: {
  initialData?: WorkOrderDTO[];
}) {
  const [q, setQ] = React.useState("");
  const [data] = React.useState<WorkOrderDTO[]>(initialData);

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter((w) =>
      [w.code, w.title, w.clientName, w.status.replace("_", " ")].some((f) =>
        f.toLowerCase().includes(t)
      )
    );
  }, [q, data]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="rounded-md border bg-white px-3 py-3">
        <div className="text-xl font-semibold">Ordens de Serviço</div>
      </div>

      {/* Busca + Nova OS */}
      <div className="mb-4 mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código, cliente, título, status…"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/workorders/new">
            <Button className="btn-brand text-white">
              <Plus className="mr-2 h-4 w-4" /> Nova OS
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-md border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Código</th>
              <th className="px-4 py-2 text-left font-medium">Título</th>
              <th className="px-4 py-2 text-left font-medium">Cliente</th>
              <th className="px-4 py-2 text-left font-medium">Agendada</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-4 py-2 font-medium text-slate-800">{w.code}</td>
                <td className="px-4 py-2">{w.title}</td>
                <td className="px-4 py-2">{w.clientName}</td>
                <td className="px-4 py-2 text-slate-600">
                  {w.scheduledAt ? new Date(w.scheduledAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2">{statusBadge(w.status)}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/workorders/${w.id}`}>
                    <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50">
                      Abrir
                    </button>
                  </Link>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma OS encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
