import { UsersRound } from "lucide-react";

import TechnicianTable from "@/components/technicians/TechnicianTable";

import { listTechnicians } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function TechniciansPage() {
  const data = await listTechnicians();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <UsersRound className="h-3.5 w-3.5" />
            Equipe de campo
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
            Técnicos
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Gerencie os profissionais que acessam o aplicativo, executam
            atendimentos e recebem rotas.
          </p>
        </header>

        <TechnicianTable initialData={data} />
      </div>
    </div>
  );
}