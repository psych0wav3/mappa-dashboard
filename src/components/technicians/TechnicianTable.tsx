"use client";

import * as React from "react";
import TechnicianForm from "./TechnicianForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

type TechRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  role?: "OWNER" | "TECH" | null;
  active?: boolean | null;
};

const roleLabel = (r?: TechRow["role"]) => (r === "OWNER" ? "Administrador" : "Técnico");

export default function TechnicianTable({ initialData }: { initialData: TechRow[] }) {
  const [tab, setTab] = React.useState<"active" | "inactive">("active");
  const [q, setQ] = React.useState("");

  const counts = React.useMemo(() => {
    const act = initialData.filter((t) => t.active !== false).length;
    const ina = initialData.length - act;
    return { act, ina };
  }, [initialData]);

  const filtered = React.useMemo(() => {
    const list = initialData.filter((t) =>
      tab === "active" ? t.active !== false : t.active === false
    );
    if (!q.trim()) return list;

    const term = q.toLowerCase();
    const norm = (v?: string | null) => (v ?? "").toLowerCase();

    return list.filter((t) =>
      [`${t.firstName ?? ""} ${t.lastName ?? ""}`, t.email, t.phone, t.cpf, roleLabel(t.role)]
        .map(norm)
        .some((v) => v.includes(term))
    );
  }, [initialData, tab, q]);

  return (
    <div className="space-y-3">
      {/* Toolbar: usa grid para se ajustar bem no mobile/tablet */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:items-center">
        {/* Abas */}
        <div className="flex w-full items-center gap-2">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 rounded-full px-3 py-2 text-sm border transition ${
              tab === "active"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-neutral-700 border-neutral-300"
            }`}
          >
            Ativos ({counts.act})
          </button>
          <button
            onClick={() => setTab("inactive")}
            className={`flex-1 rounded-full px-3 py-2 text-sm border transition ${
              tab === "inactive"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-neutral-700 border-neutral-300"
            }`}
          >
            Inativos ({counts.ina})
          </button>
        </div>

        {/* Busca */}
        <div className="flex items-center lg:justify-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, email, telefone…"
            className="w-full lg:max-w-md"
          />
        </div>

        {/* Novo técnico */}
        <div className="flex items-center justify-end">
          <TechnicianForm
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full lg:w-auto">
                Novo técnico
              </Button>
            }
          />
        </div>
      </div>

      {/* ==== LISTA MOBILE + TABLET  ( < lg )  ==== */}
      <ul className="space-y-2 lg:hidden">
        {filtered.map((t) => (
          <li key={t.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-neutral-900 truncate">
                  {t.firstName} {t.lastName}
                </div>
                <div className="text-sm text-neutral-700 break-words">{t.email}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-600">
                  <span className="whitespace-nowrap">{t.phone ?? "—"}</span>
                  <span className="whitespace-nowrap">CPF: {t.cpf ?? "—"}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs whitespace-nowrap">
                    {roleLabel(t.role)}
                  </span>
                </div>
              </div>

              <TechnicianForm
                id={t.id}
                defaultValues={t as any}
                trigger={
                  <Button
                    size="sm"
                    className="shrink-0 h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                    aria-label="Editar técnico"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Button>
                }
              />
            </div>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="p-6 text-center text-sm text-neutral-500">
            Nenhum técnico encontrado.
          </li>
        )}
      </ul>

      {/* ==== TABELA DESKTOP  ( ≥ lg ) ==== */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="text-neutral-700">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Telefone</th>
                <th className="text-left p-3 font-medium">CPF</th>
                <th className="text-left p-3 font-medium">Cargo</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{t.firstName} {t.lastName}</td>
                  <td className="p-3 break-words max-w-[360px]">{t.email}</td>
                  <td className="p-3 whitespace-nowrap">{t.phone ?? "—"}</td>
                  <td className="p-3 whitespace-nowrap">{t.cpf ?? "—"}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs whitespace-nowrap">
                      {roleLabel(t.role)}
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
                            aria-label="Editar técnico"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
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
    </div>
  );
}
