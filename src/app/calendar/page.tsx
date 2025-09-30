// src/app/calendar/page.tsx
"use client";

import * as React from "react";

import Shell from "@/components/shell/Shell";
import { Button } from "@/components/ui/button";

import DayStepper from "@/components/calendar/DayStepper";
import TechColumn from "@/components/calendar/TechColumn";
import { Instance as CardInstance } from "@/components/calendar/VisitCard";
import IconDatePicker from "@/components/calendar/IconDatePicker";
import DayBanner from "@/components/calendar/DayBanner";

import {
  ensureInstancesForDate,
  listInstances,
  listTechniciansLite,
  moveInstance,
  reorderInstances,
} from "./actions";

type Tech = { id: string; firstName: string; lastName: string };

// helpers de data
const toISO = (d: Date) => d.toISOString().slice(0, 10);

export default function CalendarPage() {
  const [date, setDate] = React.useState<string>(toISO(new Date()));
  const [techs, setTechs] = React.useState<Tech[]>([]);
  const [instances, setInstances] = React.useState<
    (CardInstance & { technician: { id: string } })[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  // carrega técnicos
  React.useEffect(() => {
    (async () => setTechs(await listTechniciansLite()))();
  }, []);

  // (re)carrega instâncias do dia
  const refresh = React.useCallback(async () => {
    setLoading(true);
    await ensureInstancesForDate(date);
    const rows = (await listInstances(date)) as any;
    setInstances(rows);
    setLoading(false);
  }, [date]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // ---- Drag & Drop leve (HTML5) ----
  const dragRef = React.useRef<{ id: string } | null>(null);

  const onDragStartCard = (e: React.DragEvent, inst: CardInstance) => {
    dragRef.current = { id: inst.id };
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropColumn =
    (techId: string) => async (e: React.DragEvent<Element>) => {
      e.preventDefault();
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      await moveInstance(date, d.id, techId);
      await refresh();
    };

  const onDropBeforeCard =
    (techId: string) =>
    async (e: React.DragEvent<Element>, beforeId: string) => {
      e.preventDefault();
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      await moveInstance(date, d.id, techId, beforeId);
      await refresh();
    };

  // agrupamento por técnico
  const byTech = React.useMemo(() => {
    const map: Record<string, CardInstance[]> = {};
    for (const t of techs) map[t.id] = [];
    for (const i of instances) (map[i.technician.id] ??= []).push(i);
    for (const tid of Object.keys(map)) map[tid].sort((a, b) => a.order - b.order);
    return map;
  }, [instances, techs]);

  const goToday = () => setDate(toISO(new Date()));

  return (
    <Shell>
      <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Linha do título – apenas o botão Atualizar */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800">
              Calendário
            </h1>
            <Button
              onClick={refresh}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Atualizar
            </Button>
          </div>

          {/* Navegação por DIA: stepper + Hoje + date picker em ícone */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DayStepper dateISO={date} onChange={setDate} />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToday} title="Voltar para hoje">
                Hoje
              </Button>
              <IconDatePicker value={date} onChange={setDate} />
            </div>
          </div>

          {/* Board por técnico com banner azul do dia da semana */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            {/* Faixa azul ocupando toda a largura do container */}
            <DayBanner dateISO={date} />

            <div className="p-4 lg:p-6">
              {loading && (
                <div className="mb-3 text-sm text-neutral-500">carregando…</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {techs.map((t) => (
                  <TechColumn
                    key={t.id}
                    tech={t}
                    items={(byTech[t.id] ?? []) as CardInstance[]}
                    onNormalize={async () => {
                      const ids = (byTech[t.id] ?? []).map((x) => x.id);
                      await reorderInstances(date, t.id, ids);
                      await refresh();
                    }}
                    onDropColumn={(e) => onDropColumn(t.id)(e)}
                    onDragStartCard={onDragStartCard}
                    onDropBeforeCard={(e, beforeId) =>
                      onDropBeforeCard(t.id)(e, beforeId)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
