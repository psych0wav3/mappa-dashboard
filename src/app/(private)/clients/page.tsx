import { UsersRound } from "lucide-react";

import ClientTable from "@/components/clients/ClientTable";

import { listClients } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <UsersRound className="h-3.5 w-3.5" />
            Carteira de clientes
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
            Clientes
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cadastre clientes, piscinas e locais de atendimento utilizados nos
            planos, ordens de serviço e rotas.
          </p>
        </header>

        <ClientTable initialData={clients} />
      </div>
    </div>
  );
}