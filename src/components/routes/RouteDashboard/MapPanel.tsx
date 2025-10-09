"use client";

import * as React from "react";
import MapCanvas from "../MapCanvas";
import { TechDay } from "./types";

type Props = {
  items: TechDay[];
  selected: TechDay | null;
  mode: "selected" | "all";
  onMode: (m: "selected" | "all") => void;
};

export default function MapPanel({ items, selected, mode, onMode }: Props) {
  const markers = React.useMemo(() => {
    if (mode === "selected") {
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
  }, [items, selected, mode]);

  const pinColor = React.useCallback(
    (m: any) => (mode === "selected" ? "#0077C8" : m.techId === selected?.techId ? "#0077C8" : "#9ca3af"),
    [mode, selected?.techId]
  );

  return (
    <div className="col-span-12 lg:col-span-4 space-y-2">
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            onClick={() => onMode("selected")}
            className={`px-3 py-1.5 text-sm ${mode === "selected" ? "btn-brand text-white" : "hover:bg-neutral-50"}`}
          >
            Rota selecionada
          </button>
          <button
            onClick={() => onMode("all")}
            className={`px-3 py-1.5 text-sm border-l ${mode === "all" ? "btn-brand text-white" : "hover:bg-neutral-50"}`}
          >
            Todas as rotas
          </button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <MapCanvas
          markers={markers.map((m) => ({ id: m.id, lat: m.lat, lng: m.lng, label: m.label }))}
          height={520}
          pinColor={(m) => pinColor({ ...m, techId: (markers.find((x: any) => x.id === m.id) as any)?.techId })}
          pinGlyphColor={() => "#ffffff"}
          maxZoomAfterFit={15}
        />
      </div>
    </div>
  );
}
