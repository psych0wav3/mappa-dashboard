"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TechnicianForm from "./TechnicianForm";
import { Button } from "@/components/ui/button";
import { Search, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteTechnician } from "@/app/(private)/technicians/actions";

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

const INACTIVE_STORAGE_KEY = "aqua-mappa:inactive-technicians";

function readInactiveIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = window.localStorage.getItem(INACTIVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(parsed.filter((item) => typeof item === "string"));
  } catch {
    return new Set<string>();
  }
}

function writeInactiveIds(ids: Set<string>) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    INACTIVE_STORAGE_KEY,
    JSON.stringify(Array.from(ids)),
  );
}

function applyLocalInactiveStatus(data: Tech[]) {
  const inactiveIds = readInactiveIds();

  return data.map((item) => ({
    ...item,
    active: item.active && !inactiveIds.has(item.id),
  }));
}

function fullName(t: Tech) {
  return [t.firstName, t.lastName].filter(Boolean).join(" ") || "—";
}

export default function TechnicianTable({
  initialData,
}: {
  initialData: Tech[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Tech[]>(initialData ?? []);
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [q, setQ] = useState("");

  useEffect(() => {
    setRows(applyLocalInactiveStatus(initialData ?? []));
    setTab("active");
    setQ("");
  }, [initialData]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast.success("Técnico cadastrado com sucesso.");
      router.replace("/technicians", { scroll: false });
    }
  }, [searchParams, router]);

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
      [t.firstName, t.lastName, t.email, f(t.phone), f(t.cpf)]
        .join(" ")
        .toLowerCase()
        .includes(k),
    );
  }, [rows, tab, q]);

  function handleDeactivate(id: string) {
    const inactiveIds = readInactiveIds();
    inactiveIds.add(id);
    writeInactiveIds(inactiveIds);

    setRows((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      ),
    );

    setTab("inactive");
    toast.success("Técnico inativado.");
  }

  function handleReactivate(id: string) {
    const inactiveIds = readInactiveIds();
    inactiveIds.delete(id);
    writeInactiveIds(inactiveIds);

    setRows((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: true } : item,
      ),
    );

    setTab("active");
    toast.success("Técnico reativado.");
  }

  async function handleDelete(id: string) {
    await deleteTechnician(id);

    const inactiveIds = readInactiveIds();
    inactiveIds.delete(id);
    writeInactiveIds(inactiveIds);

    setRows((current) => current.filter((item) => item.id !== id));
    toast.success("Técnico excluído definitivamente.");
    router.refresh();
  }

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
          <button
            type="button"
            onClick={() => setTab("active")}
            className={tabBtn(tab === "active")}
          >
            Ativos ({counts.act})
          </button>

          <button
            type="button"
            onClick={() => setTab("inactive")}
            className={tabBtn(tab === "inactive")}
          >
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
              placeholder="Buscar por nome, email, telefone ou CPF…"
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

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">CPF</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Cargo</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {data.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{fullName(t)}</td>

                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.phone ?? "—"}</td>
                <td className="p-3">{t.cpf ?? "—"}</td>

                <td className="p-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      t.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-neutral-300 bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {t.active ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="p-3">
                  <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                    {t.role === "OWNER" ? "Administrador" : "Técnico"}
                  </span>
                </td>

                <td className="p-3">
                  <div className="flex justify-end">
                    <TechnicianForm
                      id={t.id}
                      defaultValues={t}
                      onDeactivate={() => handleDeactivate(t.id)}
                      onReactivate={() => handleReactivate(t.id)}
                      onDelete={() => handleDelete(t.id)}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          title="Visualizar técnico"
                          aria-label="Visualizar técnico"
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
                <td className="p-6 text-center text-neutral-500" colSpan={7}>
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