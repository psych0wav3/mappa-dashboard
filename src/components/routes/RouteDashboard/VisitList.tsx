"use client";

import * as React from "react";
import { TechDay, Visit, pad2 } from "./types";

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
        {v.address && <div className="text-xs text-neutral-600 truncate">{v.address}</div>}
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

export default function VisitList({ tech }: { tech: TechDay | null }) {
  return (
    <div className="rounded-lg border p-3 h-full">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Rota do técnico</div>
        <div className="text-sm text-neutral-500">{tech ? tech.techName : "—"}</div>
      </div>
      <div className="mt-2 divide-y">
        {tech ? (
          tech.visits.map((v, i) => <VisitRow key={v.id} v={v} idx={i} />)
        ) : (
          <div className="text-sm text-neutral-500 py-6">Selecione um técnico ao lado.</div>
        )}
      </div>
    </div>
  );
}
