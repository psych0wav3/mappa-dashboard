// src/components/routes/RouteDashboard/index.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import { ApiResult, TechDay, toISODate } from "./types";
import CalendarBar from "./CalendarBar";
import TechCard from "./TechCard";
import VisitList from "./VisitList";
import MapPanel from "./MapPanel";

export default function RouteDashboard() {
  const [dateISO, setDateISO] = React.useState(() => toISODate(new Date()));
  const [items, setItems] = React.useState<TechDay[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedTechId, setSelectedTechId] = React.useState<string | null>(null);
  const [mapMode, setMapMode] = React.useState<"selected" | "all">("selected");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/route-dashboard?date=${dateISO}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao carregar");
      const data: ApiResult = await res.json();
      setItems(data.items || []);
      if (!selectedTechId && data.items?.length) setSelectedTechId(data.items[0].techId);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }, [dateISO, selectedTechId]);

  React.useEffect(() => { void load(); }, [load]);

  // Polling leve (15s) com pausa quando a aba fica oculta
  React.useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") void load(); };
    const id = window.setInterval(tick, 15000);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  const selected = items.find((t) => t.techId === selectedTechId) || null;

  return (
    <div className="rounded-xl border bg-white p-0 overflow-hidden">
      <CalendarBar dateISO={dateISO} onChangeDate={setDateISO} onRefresh={() => void load()} />

      <div className="p-4 grid grid-cols-12 gap-4">
        {/* Coluna 1: Técnicos */}
        <div className="col-span-12 lg:col-span-4 space-y-2">
          {loading && items.length === 0 ? (
            <div className="text-sm text-neutral-500">Carregando técnicos…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-neutral-500">Sem visitas para esta data.</div>
          ) : (
            items.map((t) => (
              <TechCard
                key={t.techId}
                item={t}
                selected={t.techId === selectedTechId}
                onSelect={() => setSelectedTechId(t.techId)}
              />
            ))
          )}
        </div>

        {/* Coluna 2: Visitas */}
        <div className="col-span-12 lg:col-span-4">
          <VisitList tech={selected} />
        </div>

        {/* Coluna 3: Mapa */}
        <MapPanel items={items} selected={selected} mode={mapMode} onMode={setMapMode} />
      </div>
    </div>
  );
}
