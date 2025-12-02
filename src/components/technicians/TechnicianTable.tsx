"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // 🔹 Estado local da lista, sincronizado com initialData
  const [rows, setRows] = useState<Tech[]>(initialData ?? []);

  // aba atual e busca
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [q, setQ] = useState("");

  // 🔄 sempre que initialData mudar (ex.: login em outra empresa),
  // reseta a lista, a aba e a busca
  useEffect(() => {
    setRows(initialData ?? []);
    setTab("active");
    setQ("");
  }, [initialData]);

  const counts = useMemo(() => {
    const act = rows.filter((t) => t.active).length;
    const ina = rows.length - act;
    return { act, ina };
  }, [rows]);

  const data = useMemo(() => {
    const base = rows.filter((t) => (tab === "active" ? t.active : !t.active));
    const k = q.trim().toLowerCase();
    if (!k) return base;

    const f = (s?: string | null) => (s ?? "").toLowerCase();

    return base.filter((t) =>
      [t.firstName, t.lastName, t.email, f(t.phone || ""), f(t.cpf || "")]
        .join(" ")
        .toLowerCase()
        .includes(k),
    );
  }, [rows, tab, q]);

  const tabBtn = (active: boolean) =>
    `h-9 rounded-md px-3 text-sm border ${
      active
        ? "btn-brand text-white"
        : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
    }`;

  return (
    <div className="space-y-3">
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

          <Button
            className="btn-brand text-white"
            onClick={() => router.push("/technicians/new")}
          >
            Novo técnico
          </Button>
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
                <td className="p-3">
                  {t.firstName} {t.lastName}
                </td>
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
