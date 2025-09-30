import Shell from "@/components/shell/Shell";
import TechnicianTable from "@/components/technicians/TechnicianTable";
import { listTechnicians } from "./actions";

export default async function TechniciansPage() {
  // Buscar técnicos direto do servidor (Prisma)
  const techs = await listTechnicians();

  return (
    <Shell>
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800">
              Técnicos
            </h1>
          </div>

          {/* Card da tabela */}
          <div className="rounded-xl border bg-white shadow-sm p-4 lg:p-6">
            <div className="overflow-x-auto">
              <TechnicianTable initialData={techs ?? []} />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
