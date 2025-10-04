"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import TechnicianForm from "./TechnicianForm";
import { Button } from "@/components/ui/button";
import { Search, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

type Tech = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  active: boolean;
  role: "OWNER" | "TECH";
};

export default function TechnicianTable({ initialData }: { initialData: Tech[] }) {
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const act = initialData.filter(t => t.active).length;
    const ina = initialData.length - act;
    return { act, ina };
  }, [initialData]);

  const data = useMemo(() => {
    const base = initialData.filter(t => (tab === "active" ? t.active : !t.active));
    const k = q.trim().toLowerCase();
    if (!k) return base;
    const f = (s?: string | null) => (s ?? "").toLowerCase();
    return base.filter(t =>
      [t.firstName, t.lastName, t.email, f(t.phone || ""), f(t.cpf || "")]
        .join(" ")
        .toLowerCase()
        .includes(k)
    );
  }, [initialData, tab, q]);

  const tabBtn = (active: boolean) =>
    `h-9 rounded-md px-3 text-sm border ${
      active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
    }`;

  return (
    <div className="space-y-3">
      {/* Top bar – igual ao Clientes */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button onClick={() => setTab("active")} className={tabBtn(tab === "active")}>
            Ativos ({counts.act})
          </button>
          <button onClick={() => setTab("inactive")} className={tabBtn(tab === "inactive")}>
            Inativos ({counts.ina})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-[260px] sm:w-[320px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, email, telefone…"
              className="pl-9"
            />
          </div>

          <TechnicianForm
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Novo técnico
              </Button>
            }
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">CPF</th>
              <th className="text-left p-3">Cargo</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.firstName} {t.lastName}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.phone ?? "—"}</td>
                <td className="p-3">{t.cpf ?? "—"}</td>
                <td className="p-3">
                  <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                    {t.role === "OWNER" ? "Administrador" : "Técnico"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <TechnicianForm
                      id={t.id}
                      defaultValues={t as any}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          title="Editar"
                          aria-label="Editar técnico"
                        >
                          <Pencil size={16} />
                        </Button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={6}>
                  Nenhum técnico encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
