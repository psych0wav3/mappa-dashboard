import WorkOrderTable from "@/components/workorders/WorkOrderTable";
import { listWorkOrders } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type WorkOrdersPageProps = {
  searchParams?: {
    status?: string;
    scheduledDate?: string;
    created?: string;
  };
};

export default async function WorkOrdersPage({
  searchParams,
}: WorkOrdersPageProps) {
  const status = searchParams?.status || "";
  const scheduledDate = searchParams?.scheduledDate || "";

  const data = await listWorkOrders({
    status: status || undefined,
    scheduledDate: scheduledDate || undefined,
  });

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-md border bg-white px-3 py-3">
          <div className="text-xl font-semibold">Ordens de Serviço</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm lg:p-6">
          <WorkOrderTable
            initialData={data}
            initialStatus={status}
            initialScheduledDate={scheduledDate}
            created={searchParams?.created === "1"}
          />
        </div>
      </div>
    </div>
  );
}