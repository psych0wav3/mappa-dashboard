// src/app/visits/page.tsx
import Shell from "@/components/shell/Shell";
import WeekdayTabs from "@/components/visits/WeekdayTabs";
import VisitPlanForm from "@/components/visits/VisitPlanForm";
import VisitDayBoard from "@/components/visits/VisitDayBoard";
import TechFilter from "@/components/visits/TechFilter";
import { Button } from "@/components/ui/button";
import {
  listVisitPlansForDay,
  listClientsLite,
  listTechniciansLite,
} from "./actions";

export default async function VisitsPage({
  searchParams,
}: {
  searchParams?: { day?: string; tech?: string };
}) {
  const selectedDay = normalizeDay(searchParams?.day);
  const selectedTechId = searchParams?.tech || undefined;

  const [technicians, clients, plans] = await Promise.all([
    listTechniciansLite(),
    listClientsLite(),
    listVisitPlansForDay(selectedDay, selectedTechId),
  ]);

  return (
    <Shell>
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800">
              Visitas (roteiro)
            </h1>

            {/* 🔵 Botão "Nova visita" no mesmo azul do sidebar */}
            <VisitPlanForm
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Nova visita
                </Button>
              }
              technicians={technicians}
              clients={clients}
            />
          </div>

          {/* Abas de dias */}
          <WeekdayTabs />

          {/* Filtro por técnico */}
          <div className="flex items-center justify-between">
            <TechFilter technicians={technicians} />
          </div>

          {/* Lista cards do dia */}
          <div className="rounded-xl border bg-white shadow-sm p-4 lg:p-6">
            <VisitDayBoard
              plans={plans}
              technicians={technicians}
              clients={clients}
              selectedTechId={selectedTechId}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function normalizeDay(d?: string) {
  const n = Number(d || "");
  if (n >= 1 && n <= 6) return n;
  const js = new Date().getDay(); // 0..6
  return js === 0 ? 6 : js; // dom -> 6, seg..sáb -> 1..6
}
