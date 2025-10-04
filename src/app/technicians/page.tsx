// src/app/technicians/page.tsx
import Shell from "@/components/shell/Shell";
import TechnicianTable from "@/components/technicians/TechnicianTable";
import { listTechnicians } from "./actions";

export default async function TechniciansPage() {
  let techs: any[] = [];
  let dbError = false;

  try {
    techs = await listTechnicians();
  } catch (e) {
    console.error("Falha ao buscar técnicos:", e);
    dbError = true;
  }

  return (
    <Shell>
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-2xl font-semibold text-neutral-800">Técnicos</h1>
          </div>

          {dbError && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              Não foi possível conectar ao banco de dados. Verifique suas variáveis de ambiente e a disponibilidade do Supabase.
            </div>
          )}

          <div className="rounded-xl border bg-white shadow-sm p-3 sm:p-4">
            {/* o componente já cuida da responsividade */}
            <TechnicianTable initialData={techs ?? []} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
