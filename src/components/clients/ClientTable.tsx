"use client";

import * as React from "react";

import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  UserCheck,
  UserRound,
  UsersRound,
  UserX,
} from "lucide-react";

import { toast } from "sonner";

import {
  updateClientStatus,
  type Client,
} from "@/app/(private)/clients/actions";

import {
  getErrorMessage,
} from "@/lib/mappa/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ClientForm from "./ClientForm";

function getInitials(
  name: string,
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return "C";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 1)
      .toLocaleUpperCase(
        "pt-BR",
      );
  }

  return `${parts[0][0]}${
    parts[
      parts.length - 1
    ][0]
  }`.toLocaleUpperCase(
    "pt-BR",
  );
}

function formatAddress(
  client: Client,
) {
  const address =
    client.mainAddress;

  if (!address) {
    return (
      "Endereço principal não cadastrado"
    );
  }

  const firstLine = [
    address.street,
    address.number,
  ]
    .filter(Boolean)
    .join(", ");

  const secondLine = [
    address.neighborhood,

    address.city &&
      `${address.city}${
        address.state
          ? `/${address.state}`
          : ""
      }`,
  ]
    .filter(Boolean)
    .join(" • ");

  return [
    firstLine,
    secondLine,
  ]
    .filter(Boolean)
    .join(" — ");
}

function normalizeSearch(
  value?: string | null,
) {
  return String(
    value || "",
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase(
      "pt-BR",
    );
}

type ClientTableProps = {
  initialData: Client[];
};

export default function ClientTable({
  initialData,
}: ClientTableProps) {
  const [
    rows,
    setRows,
  ] = React.useState<
    Client[]
  >(initialData ?? []);

  const [
    tab,
    setTab,
  ] = React.useState<
    "all" | "active" | "inactive"
  >("active");

  const [
    query,
    setQuery,
  ] = React.useState("");

  React.useEffect(() => {
    setRows(initialData ?? []);
  }, [initialData]);

  const counts =
    React.useMemo(() => {
      const active =
        rows.filter(
          (client) =>
            client.active,
        ).length;

      return {
        total:
          rows.length,

        active,

        inactive:
          rows.length -
          active,
      };
    }, [rows]);

  const filtered =
    React.useMemo(() => {
      const byStatus =
        rows.filter(
          (client) => {
            if (
              tab === "all"
            ) {
              return true;
            }

            return tab ===
              "active"
              ? client.active
              : !client.active;
          },
        );

      const term =
        normalizeSearch(
          query.trim(),
        );

      if (!term) {
        return byStatus;
      }

      return byStatus.filter(
        (client) => {
          const searchable =
            [
              client.name,
              client.email,
              client.phone,
              client.document,

              client
                .mainAddress
                ?.street,

              client
                .mainAddress
                ?.number,

              client
                .mainAddress
                ?.neighborhood,

              client
                .mainAddress
                ?.city,

              client
                .mainAddress
                ?.state,

              client
                .mainAddress
                ?.zipCode,
            ]
              .map(
                normalizeSearch,
              )
              .join(" ");

          return searchable.includes(
            term,
          );
        },
      );
    }, [
      query,
      rows,
      tab,
    ]);

  function updateClientInList(
    updatedClient: Client,
  ) {
    setRows((current) =>
      current.map(
        (item) =>
          item.id === updatedClient.id
            ? updatedClient
            : item,
      ),
    );
  }

  async function handleDeactivate(
    customerId: string,
  ) {
    try {
      const updated = await updateClientStatus(
        customerId,
        "INACTIVE",
      );

      updateClientInList(updated);
      setTab("inactive");
      toast.success("Cliente inativado.");
      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível inativar o cliente.",
        ),
      );
      return false;
    }
  }

  async function handleReactivate(
    customerId: string,
  ) {
    try {
      const updated = await updateClientStatus(
        customerId,
        "ACTIVE",
      );

      updateClientInList(updated);
      setTab("active");
      toast.success("Cliente reativado.");
      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível reativar o cliente.",
        ),
      );
      return false;
    }
  }

  function removeClientFromList(
    customerId: string,
  ) {
    setRows((current) =>
      current.filter(
        (client) =>
          client.id !==
          customerId,
      ),
    );
  }

  function tabClass(
    selected: boolean,
  ) {
    return [
      "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",

      selected
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
                Total de clientes
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
                Clientes ativos
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
                Clientes inativos
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
              className={tabClass(
                tab === "active",
              )}
              onClick={() =>
                setTab("active")
              }
            >
              <UserCheck className="h-4 w-4" />

              Ativos (
              {counts.active})
            </button>

            <button
              type="button"
              className={tabClass(
                tab ===
                  "inactive",
              )}
              onClick={() =>
                setTab(
                  "inactive",
                )
              }
            >
              <UserX className="h-4 w-4" />

              Inativos (
              {counts.inactive})
            </button>
          </div>

          <div className="relative w-full lg:w-[460px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Buscar por nome, e-mail, telefone, documento ou endereço..."
              className="h-10 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contato
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Endereço principal
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (client) => (
                    <tr
                      key={
                        client.id
                      }
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-xs font-bold text-sky-700">
                            {getInitials(
                              client.name,
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {client.name}
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                              {client.document ? (
                                <Building2 className="h-3.5 w-3.5" />
                              ) : (
                                <UserRound className="h-3.5 w-3.5" />
                              )}

                              <span>
                                {client.document ||
                                  "Documento não informado"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="truncate">
                              {client.email ||
                                "E-mail não informado"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span>
                              {client.phone ||
                                "Telefone não informado"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[330px] px-4 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

                          <span
                            className="line-clamp-2 text-sm leading-5 text-slate-600"
                            title={formatAddress(
                              client,
                            )}
                          >
                            {formatAddress(
                              client,
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",

                            client.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {client.active
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <ClientForm
                            clientId={
                              client.id
                            }
                            summary={
                              client
                            }
                            onUpdated={
                              updateClientInList
                            }
                            onDeactivate={() =>
                              handleDeactivate(
                                client.id,
                              )
                            }
                            onReactivate={() =>
                              handleReactivate(
                                client.id,
                              )
                            }
                            onDeleted={() =>
                              removeClientFromList(
                                client.id,
                              )
                            }
                            trigger={
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                title="Visualizar cliente"
                                aria-label="Visualizar cliente"
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

                {filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-14 text-center"
                    >
                      <UserRound className="mx-auto h-9 w-9 text-slate-300" />

                      <h3 className="mt-3 text-sm font-semibold text-slate-700">
                        Nenhum cliente
                        encontrado
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                        Não existem
                        clientes nesta
                        categoria ou
                        nenhum resultado
                        corresponde à sua
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