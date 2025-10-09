"use client";

import * as React from "react";
import { TechDay } from "./types";

function CircleProgress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div
      className="relative h-14 w-14 shrink-0 rounded-full grid place-items-center"
      style={{ background: `conic-gradient(var(--ac-blue-700) ${pct}%, #e5e7eb ${pct}% 100%)` }}
      aria-label={`Progresso: ${value}/${total}`}
      role="img"
    >
      <div className="absolute inset-1 rounded-full bg-white" />
      <div className="relative text-center leading-tight">
        <div className="text-[11px] font-semibold text-neutral-900">
          {value}/{total}
        </div>
        <div className="text-[10px] text-neutral-500 -mt-0.5">piscinas</div>
      </div>
    </div>
  );
}

function StatRow({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[12px] text-neutral-600">
      <span className="truncate">{left}</span>
      <span className="tabular-nums">{right}</span>
    </div>
  );
}

type Props = {
  item: TechDay;
  selected: boolean;
  onSelect: () => void;
};

export default function TechCard({ item, selected, onSelect }: Props) {
  const completed = item.done;
  const total = (item as any).total ?? item.planned ?? item.visits.length;
  const remaining = Math.max(0, total - completed);
  const dist = Number.isFinite(item.distanceKm) ? `${(item.distanceKm || 0).toFixed(1)} km` : "—";
  const durMin = item.durationMin ?? 0;
  const durStr =
    Number.isFinite(durMin) && durMin > 0
      ? `${Math.floor(durMin / 60)}h ${String(durMin % 60).padStart(2, "0")}m`
      : "—";

  return (
    <button
      onClick={onSelect}
      className={[
        "w-full text-left rounded-lg border transition shadow-sm",
        selected
          ? "border-[color:var(--ac-blue-300)] ring-1 ring-[color:var(--ac-blue-300)] bg-blue-50/40"
          : "hover:bg-neutral-50",
      ].join(" ")}
    >
      <div className="flex gap-3 p-3">
        <CircleProgress value={completed} total={total} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="font-semibold text-neutral-900 truncate pr-2">{item.techName}</div>
            <div className="h-5 w-5 rounded text-neutral-300">···</div>
          </div>

          <div className="mt-1 h-1.5 rounded bg-neutral-200 overflow-hidden">
            <div
              className="h-full rounded bg-[color:var(--ac-blue-700)] transition-all"
              style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
            />
          </div>          
        </div>
      </div>
    </button>
  );
}
