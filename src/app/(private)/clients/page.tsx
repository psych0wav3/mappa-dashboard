import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  Plus,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import ClientTable from "@/components/clients/ClientTable";

import {
  listClients,
} from "./actions";

export const dynamic =
  "force-dynamic";

export const fetchCache =
  "force-no-store";

export const metadata: Metadata = {
  title:
    "Clientes — Aqua Mappa",
};

export default async function ClientsPage() {
  const clients =
    await listClients();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                <UsersRound className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <UserRoundPlus className="h-3.5 w-3.5" />

                  Carteira de clientes
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  Clientes
                </h1>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Cadastre clientes,
                  piscinas e locais de
                  atendimento utilizados
                  nas rotinas, ordens de
                  serviço e rotas.
                </p>
              </div>
            </div>

            <Link
              href="/clients/new"
              className="btn-brand inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-5 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
            >
              <Plus className="mr-2 h-4 w-4 shrink-0" />

              Novo cliente
            </Link>
          </div>
        </header>

        <ClientTable
          initialData={clients}
        />
      </div>
    </main>
  );
}