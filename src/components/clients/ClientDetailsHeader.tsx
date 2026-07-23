"use client";

import { UserRound } from "lucide-react";

export default function ClientDetailsHeader() {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="flex items-start gap-4 px-5 py-5 pr-16 sm:px-8 sm:py-6 sm:pr-20">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
          <UserRound className="h-6 w-6" />
        </div>

        <div className="min-w-0 text-left">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Detalhes do cliente
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Consulte os dados cadastrais, informações de contato e locais de
            atendimento.
          </p>
        </div>
      </div>
    </header>
  );
}