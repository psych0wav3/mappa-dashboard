"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserRound,
  UsersRound,
  UserX,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";

import { deleteTechnician } from "@/app/(private)/technicians/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import TechnicianForm from "./TechnicianForm";

type Tech = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  active: boolean;
  role: "OWNER" | "TECH";
};

const INACTIVE_STORAGE_KEY =
  "aqua-mappa:inactive-technicians";

function readInactiveIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(
      INACTIVE_STORAGE_KEY,
    );

    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed.filter(
        (item): item is string =>
          typeof item === "string",
      ),
    );
  } catch {
    return new Set<string>();
  }
}

function writeInactiveIds(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    INACTIVE_STORAGE_KEY,
    JSON.stringify(Array.from(ids)),
  );
}

function applyLocalInactiveStatus(data: Tech[]) {
  const inactiveIds = readInactiveIds();

  return data.map((item) => ({
    ...item,
    active:
      item.active &&
      !inactiveIds.has(item.id),
  }));
}

function fullName(technician: Tech) {
  return (
    [
      technician.firstName,
      technician.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "—"
  );
}

function getInitials(technician: Tech) {
  const name = fullName(technician);

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length || name === "—") {
    return "T";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toLocaleUpperCase("pt-BR");
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toLocaleUpperCase("pt-BR");
}

export default function TechnicianTable({
  initialData,
}: {
  initialData: Tech[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createdToastShownRef =
    useRef(false);

  const [rows, setRows] = useState<Tech[]>(
    initialData ?? [],
  );

  const [tab, setTab] = useState<
    "active" | "inactive"
  >("active");

  const [query, setQuery] = useState("");

  /*
   * Os dados recebidos da API são combinados com os IDs
   * que foram inativados localmente.
   */
  useEffect(() => {
    setRows(
      applyLocalInactiveStatus(
        initialData ?? [],
      ),
    );

    setTab("active");
    setQuery("");
  }, [initialData]);

  /*
   * Exibe a notificação de criação apenas uma vez.
   */
  useEffect(() => {
    const wasCreated =
      searchParams.get("created") === "1";

    if (
      !wasCreated ||
      createdToastShownRef.current
    ) {
      return;
    }

    createdToastShownRef.current = true;

    toast.success(
      "Técnico cadastrado com sucesso.",
    );

    router.replace("/technicians", {
      scroll: false,
    });
  }, [router, searchParams]);

  /*
   * Os cards e as abas utilizam exatamente o mesmo estado.
   * Dessa forma, os números continuam sincronizados.
   */
  const counts = useMemo(() => {
    const active = rows.filter(
      (technician) => technician.active,
    ).length;

    return {
      total: rows.length,
      active,
      inactive: rows.length - active,
    };
  }, [rows]);

  const data = useMemo(() => {
    const filteredByStatus = rows.filter(
      (technician) =>
        tab === "active"
          ? technician.active
          : !technician.active,
    );

    const keyword = query
      .trim()
      .toLocaleLowerCase("pt-BR");

    if (!keyword) {
      return filteredByStatus;
    }

    return filteredByStatus.filter(
      (technician) => {
        const searchableContent = [
          technician.firstName,
          technician.lastName,
          technician.email,
          technician.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return searchableContent.includes(
          keyword,
        );
      },
    );
  }, [rows, tab, query]);

  function handleDeactivate(id: string) {
    const inactiveIds =
      readInactiveIds();

    inactiveIds.add(id);
    writeInactiveIds(inactiveIds);

    setRows((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              active: false,
            }
          : item,
      ),
    );

    setTab("inactive");

    toast.success(
      "Técnico inativado.",
    );
  }

  function handleReactivate(id: string) {
    const inactiveIds =
      readInactiveIds();

    inactiveIds.delete(id);
    writeInactiveIds(inactiveIds);

    setRows((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              active: true,
            }
          : item,
      ),
    );

    setTab("active");

    toast.success(
      "Técnico reativado.",
    );
  }

  async function handleDelete(id: string) {
    try {
      await deleteTechnician(id);

      const inactiveIds =
        readInactiveIds();

      inactiveIds.delete(id);
      writeInactiveIds(inactiveIds);

      setRows((current) =>
        current.filter(
          (item) => item.id !== id,
        ),
      );

      toast.success(
        "Técnico excluído definitivamente.",
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o técnico.",
      );
    }
  }

  function tabButtonClass(
    isSelected: boolean,
  ) {
    return [
      "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
      isSelected
        ? "border-sky-600 bg-sky-600 text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    ].join(" ");
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total de técnicos
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {counts.total}
              </p>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <UsersRound className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Técnicos ativos
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {counts.active}
              </p>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Técnicos inativos
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-800">
                {counts.inactive}
              </p>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-amber-700 shadow-sm">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setTab("active")
              }
              className={tabButtonClass(
                tab === "active",
              )}
            >
              <UserCheck className="h-4 w-4" />

              Ativos ({counts.active})
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("inactive")
              }
              className={tabButtonClass(
                tab === "inactive",
              )}
            >
              <UserX className="h-4 w-4" />

              Inativos ({counts.inactive})
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="h-10 rounded-xl pl-10"
              />
            </div>

            <Button
              type="button"
              className="btn-brand h-10 rounded-xl px-5 text-white"
              onClick={() =>
                router.push(
                  "/technicians/new",
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />

              Novo técnico
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Técnico
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contato
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cargo
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.map(
                  (technician) => (
                    <tr
                      key={technician.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-xs font-bold text-sky-700">
                            {getInitials(
                              technician,
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {fullName(
                                technician,
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Profissional de campo
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">
                          {technician.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {technician.phone ||
                            "Telefone não informado"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                            technician.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {technician.active
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {technician.role ===
                          "OWNER"
                            ? "Administrador"
                            : "Técnico"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <TechnicianForm
                            id={technician.id}
                            defaultValues={
                              technician
                            }
                            onDeactivate={() =>
                              handleDeactivate(
                                technician.id,
                              )
                            }
                            onReactivate={() =>
                              handleReactivate(
                                technician.id,
                              )
                            }
                            onDelete={() =>
                              handleDelete(
                                technician.id,
                              )
                            }
                            trigger={
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                title="Visualizar técnico"
                                aria-label="Visualizar técnico"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {data.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-14 text-center"
                      colSpan={5}
                    >
                      <UserRound className="mx-auto h-9 w-9 text-slate-300" />

                      <h3 className="mt-3 text-sm font-semibold text-slate-700">
                        Nenhum técnico encontrado
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                        Não existem profissionais
                        nesta categoria ou nenhum
                        resultado corresponde à sua
                        busca.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}