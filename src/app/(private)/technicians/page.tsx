// src/app/(private)/technicians/page.tsx

import TechnicianTable from "@/components/technicians/TechnicianTable";
import { listTechnicians } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function TechniciansPage() {
  const data = await listTechnicians();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        <div className="rounded-md border bg-white px-3 py-3">
          <div className="text-xl font-semibold">Técnicos</div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-4 lg:p-6">
          <div className="overflow-x-auto">
            <TechnicianTable initialData={data} />
          </div>
        </div>
      </div>
    </div>
  );
}