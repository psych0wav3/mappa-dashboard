// src/components/routes/RouteDashboard.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import MapCanvas from "./MapCanvas";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";

/* ===== Tipos ===== */
type Visit = {
  id: string;
  clientName: string;
  windowStart: number;
  windowEnd: number;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | string;
  lat?: number | null;
  lng?: number | null;
};
type TechDay = {
  techId: string;
  techName: string;
  planned: number;
  done: number;
  durationMin?: number;
  distanceKm?: number;
  visits: Visit[];
};
type ApiResult = { items: TechDay[] };

/* ===== Utils ===== */
const pad2 = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDays = (iso: string, delta: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
};
function formatLongDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}
function getWeekStrip(centerISO: string) {
  const d = new Date(centerISO + "T00:00:00");
  const dow = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - dow);
  const todayISO = toISODate(new Date());
  const days: { iso: string; wd: string; dd: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    days.push({
      iso: toISODate(dd),
      wd: dd.toLocaleDateString("pt-BR", { weekday: "short" }),
      dd: pad2(dd.getDate()),
      isToday: toISODate(dd) === todayISO,
    });
  }
  return days;
}

/* ===== Chips ===== */
function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

function TechCard({
  item,
  selected,
  onSelect,
}: {
  item: TechDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const remaining = Math.max(0, item.planned - item.done);
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg border p-3 transition ${
        selected ? "border-blue-500 bg-blue-50" : "hover:bg-neutral-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{item.techName}</div>
        <div className="text-xs text-neutral-500">{item.visits.length} visitas</div>
      </div>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <StatPill>Feitas: {item.done}</StatPill>
        <StatPill>Pendentes: {remaining}</StatPill>
        <StatPill>Total: {item.planned}</StatPill>
        {Number.isFinite(item.durationMin) && (
          <StatPill>
            {Math.floor((item.durationMin || 0) / 60)}h {pad2((item.durationMin || 0) % 60)}m
          </StatPill>
        )}
        {Number.isFinite(item.distanceKm) && (
          <StatPill>{(item.distanceKm || 0).toFixed(1)} km</StatPill>
        )}
      </div>
    </button>
  );
}

function VisitRow({ v, idx }: { v: Visit; idx: number }) {
  const statusMap: Record<string, string> = {
    PLANNED: "Planejada",
    IN_PROGRESS: "Em andamento",
    DONE: "Concluída",
  };
  return (
    <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b py-2">
      <div className="w-8 h-8 rounded-full btn-brand text-white flex items-center justify-center text-sm font-semibold">
        {idx + 1}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{v.clientName}</div>
        <div className="text-xs text-neutral-500">
          {pad2(v.windowStart)}:00—{pad2(v.windowEnd)}:00 · {statusMap[v.status] || v.status}
        </div>
      </div>
      <div className="text-xs text-neutral-500">
        {Number.isFinite(v.lat) && Number.isFinite(v.lng) ? "geo✓" : "geo?"}
      </div>
    </div>
  );
}

/* ===== Principal ===== */
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

  React.useEffect(() => {
    void load();
  }, [load]);

  const selected = items.find((t) => t.techId === selectedTechId) || null;
  const week = getWeekStrip(dateISO);

  // markers para o mapa
  const markers = React.useMemo(() => {
    if (mapMode === "selected") {
      if (!selected) return [];
      return selected.visits
        .map((v, i) =>
          Number.isFinite(v.lat as number) && Number.isFinite(v.lng as number)
            ? { id: v.id, lat: v.lat as number, lng: v.lng as number, label: String(i + 1), techId: selected.techId }
            : null
        )
        .filter(Boolean) as any[];
    }
    const out: any[] = [];
    items.forEach((t) => {
      let k = 0;
      t.visits.forEach((v) => {
        if (Number.isFinite(v.lat as number) && Number.isFinite(v.lng as number)) {
          out.push({ id: v.id, lat: v.lat as number, lng: v.lng as number, label: String(++k), techId: t.techId });
        }
      });
    });
    return out;
  }, [items, selected, mapMode]);

  // usa o azul da marca (aciona degradê no MapCanvas)
  const pinColor = React.useCallback(
    (m: any) => (mapMode === "selected" ? "#0077C8" : m.techId === selectedTechId ? "#0077C8" : "#9ca3af"),
    [mapMode, selectedTechId]
  );

  return (
    <div className="rounded-xl border bg-white p-0 overflow-hidden">
      {/* ===== Calendário no azul da marca ===== */}
      <div
        className="px-4 py-3"
        style={{ background: "var(--ac-blue-700)", color: "white" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Data por extenso */}
          <div className="font-semibold">{formatLongDate(dateISO)}</div>

          {/* Navegação */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDateISO(addDays(dateISO, -1))}
              className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center"
              title="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Faixa de 7 dias */}
            <div className="flex items-stretch rounded-md overflow-hidden border border-white/30">
              {week.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => setDateISO(d.iso)}
                  className={`px-3 py-1.5 text-sm border-l border-white/20 first:border-l-0 ${
                    d.iso === dateISO
                      ? "bg-white font-semibold"
                      : d.isToday
                      ? "bg-white/10"
                      : "bg-transparent hover:bg-white/10"
                  }`}
                  style={d.iso === dateISO ? { color: "var(--ac-blue-700)" } : undefined}
                >
                  <div className="leading-none">{d.wd}</div>
                  <div className="text-xs opacity-90">{d.dd}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setDateISO(addDays(dateISO, +1))}
              className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center"
              title="Próximo dia"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Ações */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDateISO(toISODate(new Date()))}
              className="h-8 rounded-md bg-white px-3 text-sm font-medium hover:bg-neutral-100"
              style={{ color: "var(--ac-blue-700)" }}
            >
              Hoje
            </button>
            <label
              className="h-8 rounded-md bg-white px-3 text-sm font-medium hover:bg-neutral-100 inline-flex items-center gap-2 cursor-pointer"
              style={{ color: "var(--ac-blue-700)" }}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Calendário</span>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="sr-only"
              />
            </label>
            <button
              onClick={() => void load()}
              className="h-8 rounded-md bg-white px-3 text-sm font-medium hover:bg-neutral-100 inline-flex items-center gap-2"
              style={{ color: "var(--ac-blue-700)" }}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* ===== Conteúdo ===== */}
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

        {/* Coluna 2: Rota do técnico selecionado */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border p-3 h-full">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Rota do técnico</div>
              <div className="text-sm text-neutral-500">{selected ? selected.techName : "—"}</div>
            </div>
            <div className="mt-2 divide-y">
              {selected ? (
                selected.visits.map((v, i) => <VisitRow key={v.id} v={v} idx={i} />)
              ) : (
                <div className="text-sm text-neutral-500 py-6">Selecione um técnico ao lado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 3: Mapa + Toggle */}
        <div className="col-span-12 lg:col-span-4 space-y-2">
          <div className="flex items-center justify-end">
            <div className="inline-flex rounded-md border overflow-hidden">
              <button
                onClick={() => setMapMode("selected")}
                className={`px-3 py-1.5 text-sm ${
                  mapMode === "selected" ? "btn-brand text-white" : "hover:bg-neutral-50"
                }`}
              >
                Rota selecionada
              </button>
              <button
                onClick={() => setMapMode("all")}
                className={`px-3 py-1.5 text-sm border-l ${
                  mapMode === "all" ? "btn-brand text-white" : "hover:bg-neutral-50"
                }`}
              >
                Todas as rotas
              </button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <MapCanvas
              markers={markers.map((m) => ({ id: m.id, lat: m.lat, lng: m.lng, label: m.label }))}
              height={520}
              pinColor={(m) =>
                pinColor({ ...m, techId: (markers.find((x) => x.id === m.id) as any)?.techId })
              }
              pinGlyphColor={() => "#ffffff"}
              maxZoomAfterFit={15}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
