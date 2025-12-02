"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { StopItem } from "@/components/routes/StopList";
import RouteAssignmentForm from "@/components/routes/RouteAssignmentForm";
import MapCanvas from "@/components/routes/MapCanvas";

// ---- Tipos auxiliares ----

type Totals = {
  count: number;
  durationMin: number;
  distanceKm: number;
};

type LeftPanelProps = {
  tech: string | null;
  weekday: number;
  setTech: Dispatch<SetStateAction<string | null>>;
  setWeekday: Dispatch<SetStateAction<number>>;
  stops: StopItem[];
  setStops: Dispatch<SetStateAction<StopItem[]>>;
  totals: Totals;
  onOptimize: () => Promise<void> | void;
};

// opções só pra ter algum UI funcional
const TECH_OPTIONS = [
  { id: "t1", name: "Técnico 1" },
  { id: "t2", name: "Técnico 2" },
];

const WEEKDAYS = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
];

// ---- Painel esquerdo (substitui o antigo LeftPanel.tsx) ----

function LeftPanel({
  tech,
  weekday,
  setTech,
  setWeekday,
  stops,
  setStops,
  totals,
  onOptimize,
}: LeftPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm">
      {/* Técnico */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          Técnico
        </label>
        <select
          value={tech ?? ""}
          onChange={(e) => setTech(e.target.value || null)}
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
        >
          <option value="">Selecione um técnico</option>
          {TECH_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dia da semana */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          Dia da semana
        </label>
        <select
          value={weekday}
          onChange={(e) => setWeekday(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
        >
          {WEEKDAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Totais */}
      <div className="rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2 space-y-1">
        <div>
          <span className="font-medium">Paradas:</span> {totals.count}
        </div>
        <div>
          <span className="font-medium">Duração estimada:</span>{" "}
          {Math.round(totals.durationMin)} min
        </div>
        <div>
          <span className="font-medium">Distância aprox.:</span>{" "}
          {totals.distanceKm.toFixed(1)} km
        </div>
      </div>

      {/* Lista simples de paradas + botão otimizar */}
      {stops.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Paradas da rota
            </p>
            <button
              type="button"
              onClick={onOptimize}
              className="rounded-md bg-sky-600 px-2 py-1 text-xs font-semibold text-white hover:bg-sky-700"
            >
              Otimizar rota
            </button>
          </div>
          <ol className="space-y-1 text-xs">
            {stops.map((s, index) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1"
              >
                <span className="truncate">
                  {index + 1}. {s.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStops((prev) => prev.filter((x) => x.id !== s.id))
                  }
                  className="text-red-500 hover:underline"
                >
                  remover
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ---- Página principal ----

export default function RouteBuilderPage() {
  const [tech, setTech] = useState<string | null>("t1");
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime] = useState<string>("08:00");
  const [stops, setStops] = useState<StopItem[]>([]);

  const markers = useMemo(
    () =>
      stops.map((s, i) => ({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        label: String(i + 1),
      })),
    [stops]
  );

  const totals: Totals = useMemo(() => {
    let durationMin = stops.reduce(
      (a, s) => a + (s.durationMin ?? 30),
      0
    );

    let distanceKm = 0;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1];
      const b = stops[i];
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const la1 = toRad(a.lat);
      const la2 = toRad(b.lat);
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(la1) *
          Math.cos(la2) *
          Math.sin(dLng / 2) ** 2;
      distanceKm += 2 * R * Math.asin(Math.sqrt(h));
    }

    if (stops[0]?.eta && stops.at(-1)?.etd) {
      const parse = (s: string) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m;
      };
      durationMin =
        parse(stops.at(-1)!.etd!) - parse(stops[0]!.eta!);
    }

    return { count: stops.length, durationMin, distanceKm };
  }, [stops]);

  async function handleOptimize() {
    const res = await fetch("/api/routes/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime,
        stops: stops.map((s) => ({
          id: s.id,
          lat: s.lat,
          lng: s.lng,
          durationMin: s.durationMin,
        })),
      }),
    });

    const j = await res.json();

    if (j?.order) {
      const byId = Object.fromEntries(
        stops.map((s) => [s.id, s])
      );
      const newStops = j.order.map((id: string) => ({
        ...byId[id],
      }));

      const byEta: Record<
        string,
        { eta: string; etd: string }
      > = {};
      for (const e of j.etas) {
        byEta[e.id] = { eta: e.eta, etd: e.etd };
      }

      setStops(
        newStops.map((s) => ({
          ...s,
          ...byEta[s.id],
        }))
      );
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Route Builder</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* ESQUERDA */}
        <div className="col-span-12 lg:col-span-4">
          <LeftPanel
            tech={tech}
            weekday={weekday}
            setTech={setTech}
            setWeekday={setWeekday}
            stops={stops}
            setStops={setStops}
            totals={totals}
            onOptimize={handleOptimize}
          />
        </div>

        {/* DIREITA */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <RouteAssignmentForm
            onAddAssignment={(c /*, cfg*/) => {
              setStops((prev) => [
                ...prev,
                {
                  id: c.id,
                  name: c.name,
                  address: c.address,
                  lat: c.lat,
                  lng: c.lng,
                  durationMin: 30,
                },
              ]);
            }}
          />

          <div className="rounded border border-slate-200 dark:border-slate-700 p-2">
            <div className="px-2 pb-2">
              <input
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-[320px] max-w-full text-sm bg-white dark:bg-slate-900"
                placeholder="Buscar endereço…"
              />
            </div>
            <MapCanvas markers={markers} />
          </div>
        </div>
      </div>
    </div>
  );
}
