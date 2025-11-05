"use client";

import * as React from "react";
import ClientForm from "./ClientForm";
import { Button } from "@/components/ui/button";
import { Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  uf?: string | null;
  cep?: string | null;
  active?: boolean | null;
};

export default function ClientTable({ initialData }: { initialData: Client[] }) {
  const [tab, setTab] = React.useState<"active" | "inactive">("active");
  const [q, setQ] = React.useState("");

  const byStatus = React.useMemo(
    () => initialData.filter((c) => (tab === "active" ? c.active !== false : c.active === false)),
    [initialData, tab]
  );

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return byStatus;

    const norm = (v?: string | null) => (v ?? "").toLowerCase();
    return byStatus.filter((c) =>
      [
        `${c.firstName ?? ""} ${c.lastName ?? ""}`,
        c.email,
        c.phone,
        c.cpf,
        c.street,
        c.number,
        c.district,
        `${c.city ?? ""} ${c.uf ?? ""}`,
        c.cep,
      ]
        .map(norm)
        .some((v) => v.includes(term))
    );
  }, [byStatus, q]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aKey = `${(a.firstName || "").toLowerCase()} ${(a.lastName || "").toLowerCase()}`;
      const bKey = `${(b.firstName || "").toLowerCase()} ${(b.lastName || "").toLowerCase()}`;
      return aKey.localeCompare(bKey, "pt-BR");
    });
    return copy;
  }, [filtered]);

  const groups = React.useMemo(() => {
    const map = new Map<string, Client[]>();
    for (const c of sorted) {
      const base = (c.firstName || "?").trim();
      const letter = base ? base[0].toUpperCase() : "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [sorted]);

  const counts = React.useMemo(() => {
    const act = initialData.filter((c) => c.active !== false).length;
    const ina = initialData.length - act;
    return { act, ina };
  }, [initialData]);

  const tabBtn = (active: boolean) =>
    `h-9 rounded-md px-3 text-sm border ${
      active
        ? "btn-brand text-white"
        : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
    }`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-center">
        {/* Tabs à esquerda */}
        <div className="flex gap-2">
          <button onClick={() => setTab("active")} className={tabBtn(tab === "active")}>
            Ativos ({counts.act})
          </button>
          <button onClick={() => setTab("inactive")} className={tabBtn(tab === "inactive")}>
            Inativos ({counts.ina})
          </button>
        </div>

        {/* Busca + Novo cliente à direita */}
        <div className="flex w-full items-center justify-end gap-2">
          <div className="relative w-full max-w-[420px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, email, telefone…"
              className="h-9 rounded-md pl-9"
            />
          </div>

          <ClientForm
            trigger={
              <Button size="sm" className="h-9 rounded-md btn-brand text-white">
                Novo cliente
              </Button>
            }
          />
        </div>
      </div>

      {/* Lista por grupos alfabéticos */}
      <div className="rounded-md border bg-white">
        {groups.length === 0 ? (
          <div className="p-6 text-center text-neutral-500">Nenhum cliente encontrado.</div>
        ) : (
          groups.map(([letter, rows]) => (
            <div key={letter} className="border-t first:border-t-0">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-50">{letter}</div>

              {rows.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-3 border-t first:border-t-0">
                  <div className="min-w-0 w-full">
                    {/* Linha 1: Nome + Telefone + Email */}
                    <div className="flex flex-col gap-1 sm:grid sm:grid-cols-3 sm:items-center">
                      <div className="min-w-0 font-medium truncate">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="min-w-0 text-sm text-neutral-700 truncate">{c.phone ?? "—"}</div>
                      <div className="min-w-0 text-sm text-neutral-700 truncate sm:text-right">{c.email}</div>
                    </div>

                    {/* Linha 2: Endereço */}
                    <div className="mt-1 text-sm text-neutral-600 truncate">
                      {[
                        c.street,
                        c.number,
                        c.district,
                        c.city && `${c.city}${c.uf ? `/${c.uf}` : ""}`,
                        c.cep,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  </div>

                  {/* Ação: Editar */}
                  <ClientForm
                    id={c.id}
                    defaultValues={c as any}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 rounded-md p-0 bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                        title="Editar"
                        aria-label="Editar cliente"
                      >
                        <Pencil size={16} />
                      </Button>
                    }
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
