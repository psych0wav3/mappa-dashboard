// src/app/routes/builder/page.tsx
import Shell from "@/components/shell/Shell";
import { listTechniciansLite, listClientsLite } from "../actions";
import RouteBuilder from "@/components/routes/RouteBuilder";

export default async function RouteBuilderPage() {
  const [technicians, clients] = await Promise.all([
    listTechniciansLite(),
    listClientsLite(),
  ]);

  return (
    <Shell>
      {/* padding padrão da app + coluna com espaçamento vertical consistente */}
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Card título */}
          <div className="rounded-md border bg-white px-3 py-3">
            <div className="text-base font-semibold">Planejamento de Rotas</div>
          </div>

          {/* Conteúdo principal */}
          <RouteBuilder technicians={technicians} clients={clients} />
        </div>
      </div>
    </Shell>
  );
}
