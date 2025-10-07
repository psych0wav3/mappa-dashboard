// src/app/clients/page.tsx
import ClientTable from "@/components/clients/ClientTable";
import { listClients } from "./actions";

export default async function ClientsPage() {
  const data = await listClients();

  return (
    
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-md border bg-white px-3 py-3">
            <div className="text-xl font-semibold">Clientes</div>
          </div>

          {/* Card da tabela */}
          <div className="rounded-xl border bg-white shadow-sm p-4 lg:p-6">
            <div className="overflow-x-auto">
              <ClientTable initialData={data} />
            </div>
          </div>
        </div>
      </div>
    
  );
}
