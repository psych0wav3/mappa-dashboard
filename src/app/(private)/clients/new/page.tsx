import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import NewClientPageClient from "./NewClientPageClient";

export const metadata: Metadata = {
  title: "Novo cliente — Aqua Mappa",
};

export default function NewClientPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <UserPlus className="h-3.5 w-3.5" />
            Novo cadastro
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
            Novo cliente
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cadastre os dados de acesso e o endereço principal da piscina ou
            local de atendimento.
          </p>
        </header>

        <NewClientPageClient />
      </div>
    </div>
  );
}