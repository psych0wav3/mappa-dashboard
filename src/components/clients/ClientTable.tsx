"use client";

import * as React from "react";
import ClientForm from "./ClientForm";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteClient } from "@/app/(private)/clients/actions";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  companyName?: string | null;

  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  uf?: string | null;
  cep?: string | null;

  poolStreet?: string | null;
  poolNumber?: string | null;
  poolDistrict?: string | null;
  poolCity?: string | null;
  poolUf?: string | null;
  poolCep?: string | null;
  poolLat?: number | null;
  poolLng?: number | null;

  active?: boolean | null;
};

type Counts = {
  active: number;
  inactive: number;
};

const INACTIVE_STORAGE_KEY = "aqua-mappa:inactive-clients";

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

function applyLocalInactiveStatus(data: Client[]) {
  const inactiveIds = readInactiveIds();

  return data.map((item) => ({
    ...item,
    active: item.active !== false && !inactiveIds.has(item.id),
  }));
}

function fullName(client: Client) {
  return [client.firstName, client.lastName].filter(Boolean).join(" ") || "—";
}

function displayName(client: Client) {
  return client.companyName?.trim() || fullName(client);
}

function documentText(client: Client) {
  return client.cnpj || client.cpf || "—";
}

function poolAddressText(client: Client) {
  const street = client.poolStreet || client.street;
  const number = client.poolNumber || client.number;
  const district = client.poolDistrict || client.district;
  const city = client.poolCity || client.city;
  const uf = client.poolUf || client.uf;
  const cep = client.poolCep || client.cep;

  const line = [
    street,
    number,
    district,
    city && `${city}${uf ? `/${uf}` : ""}`,
    cep,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Piscina sem endereço cadastrado";
}

function billingAddressText(client: Client) {
  const line = [
    client.street,
    client.number,
    client.district,
    client.city && `${client.city}${client.uf ? `/${client.uf}` : ""}`,
    client.cep,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Endereço de cobrança não cadastrado";
}

export default function ClientTable({
  initialData,
  initialSearch = "",
  initialStatus = "ACTIVE",
  counts,
  created = false,
}: {
  initialData: Client[];
  initialSearch?: string;
  initialStatus?: "ACTIVE" | "INACTIVE";
  counts?: Counts;
  created?: boolean;
}) {
  const router = useRouter();

  const [tab, setTab] = React.useState<"active" | "inactive">(
    initialStatus === "INACTIVE" ? "inactive" : "active",
  );

  const [q, setQ] = React.useState(initialSearch);
  const [rows, setRows] = React.useState<Client[]>(
    applyLocalInactiveStatus(initialData ?? []),
  );

  React.useEffect(() => {
    setRows(applyLocalInactiveStatus(initialData ?? []));
  }, [initialData]);

  React.useEffect(() => {
    if (created) {
      toast.success("Cliente cadastrado com sucesso.");
      router.replace("/clients", { scroll: false });
    }
  }, [created, router]);

  const localCounts = React.useMemo(() => {
    const active = rows.filter((client) => client.active !== false).length;
    const inactive = rows.length - active;

    return { active, inactive };
  }, [rows]);

  const effectiveCounts = counts
    ? {
        active: localCounts.active,
        inactive: localCounts.inactive,
      }
    : localCounts;

  const byStatus = React.useMemo(
    () =>
      rows.filter((client) =>
        tab === "active" ? client.active !== false : client.active === false,
      ),
    [rows, tab],
  );

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();

    if (!term) return byStatus;

    const norm = (value?: string | number | null) =>
      String(value ?? "").toLowerCase();

    return byStatus.filter((client) =>
      [
        displayName(client),
        fullName(client),
        client.companyName,
        client.email,
        client.phone,
        client.cpf,
        client.cnpj,
        client.street,
        client.number,
        client.district,
        client.city,
        client.uf,
        client.cep,
        client.poolStreet,
        client.poolNumber,
        client.poolDistrict,
        client.poolCity,
        client.poolUf,
        client.poolCep,
      ]
        .map(norm)
        .some((value) => value.includes(term)),
    );
  }, [byStatus, q]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];

    copy.sort((a, b) => {
      const aKey = displayName(a).toLowerCase();
      const bKey = displayName(b).toLowerCase();

      return aKey.localeCompare(bKey, "pt-BR");
    });

    return copy;
  }, [filtered]);

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
    toast.success("Cliente inativado.");
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
    toast.success("Cliente reativado.");
  }

  async function handleDelete(id: string) {
    await deleteClient(id);

    const inactiveIds = readInactiveIds();
    inactiveIds.delete(id);
    writeInactiveIds(inactiveIds);

    setRows((current) => current.filter((item) => item.id !== id));

    toast.success("Cliente excluído definitivamente.");
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
            Ativos ({effectiveCounts.active})
          </button>

          <button
            type="button"
            onClick={() => setTab("inactive")}
            className={tabBtn(tab === "inactive")}
          >
            Inativos ({effectiveCounts.inactive})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-[280px] sm:w-[420px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar por nome, telefone, email, CPF/CNPJ ou endereço da piscina…"
              className="pl-9"
            />
          </div>

          <Button
            className="btn-brand text-white"
            onClick={() => router.push("/clients/new")}
          >
            Novo cliente
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-3">
        {sorted.length === 0 ? (
          <div className="p-6 text-center text-neutral-500">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((client) => {
              const isActive = client.active !== false;
              const hasCompany = Boolean(client.companyName || client.cnpj);

              return (
                <div
                  key={client.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-sky-200 hover:bg-sky-50/20"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-0 truncate text-base font-semibold text-slate-900">
                          {displayName(client)}
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-300 bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {isActive ? "Ativo" : "Inativo"}
                        </span>

                        {hasCompany && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            Empresa
                          </span>
                        )}
                      </div>

                      {client.companyName && fullName(client) !== client.companyName && (
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                          <UserRound className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            Responsável: {fullName(client)}
                          </span>
                        </div>
                      )}

                      <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 lg:grid-cols-[220px_1fr]">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {client.phone || "Telefone não cadastrado"}
                          </span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {client.email || "Email não cadastrado"}
                          </span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            CPF/CNPJ: {documentText(client)}
                          </span>
                        </div>

                        <div
                          className="flex min-w-0 items-center gap-1.5"
                          title={poolAddressText(client)}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                          <span className="truncate">
                            Piscina: {poolAddressText(client)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end">
                      <ClientForm
                        id={client.id}
                        defaultValues={client as any}
                        onDeactivate={() => handleDeactivate(client.id)}
                        onReactivate={() => handleReactivate(client.id)}
                        onDelete={() => handleDelete(client.id)}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 rounded-md p-0 bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                            title="Visualizar cliente"
                            aria-label="Visualizar cliente"
                          >
                            <Pencil size={16} />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}