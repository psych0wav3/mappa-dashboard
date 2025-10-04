import Shell from "@/components/shell/Shell";
import AssignRoutes from "@/components/routes/AssignRoutes";
import { listTechniciansLite } from "../actions";

export default async function AssignRoutesPage() {
  const technicians = await listTechniciansLite();
  return (
    <Shell>
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-4">
          Atribuir rota
        </h1>
        <AssignRoutes technicians={technicians} />
      </div>
    </Shell>
  );
}
