import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import NewTechnicianClient from "./NewTechnicianClient";

export const metadata: Metadata = {
  title: "Novo técnico — Aqua Mappa",
};

export default function NewTechnicianPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Equipe técnica
              </span>

              <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                Novo técnico
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Cadastre um novo integrante da equipe técnica 
                e prepare seu acesso para a rotina operacional da empresa.
              </p>
            </div>
          </div>
        </header>

        <NewTechnicianClient />
      </div>
    </div>
  );
}