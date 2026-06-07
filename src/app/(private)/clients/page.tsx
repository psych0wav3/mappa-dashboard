import ClientTable from "@/components/clients/ClientTable";
import { listClients } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type ClientsPageProps = {
  searchParams?: {
    search?: string;
    status?: string;
    created?: string;
  };
};

function normalizeStatus(status?: string): "ACTIVE" | "INACTIVE" {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const search = searchParams?.search ?? "";
  const status = normalizeStatus(searchParams?.status);

  const [data, allForCounts] = await Promise.all([
    listClients({ search, status }),
    listClients({ search }),
  ]);

  const counts = {
    active: allForCounts.filter((client) => client.active !== false).length,
    inactive: allForCounts.filter((client) => client.active === false).length,
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        <div className="rounded-md border bg-white px-3 py-3">
          <div className="text-xl font-semibold">Clientes</div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-4 lg:p-6">
          <div className="overflow-x-auto">
            <ClientTable
              initialData={data}
              initialSearch={search}
              initialStatus={status}
              counts={counts}
              created={searchParams?.created === "1"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}