"use client";

import { ChevronRight, UserRound } from "lucide-react";
import { technicianInitials } from "./routeWeek.utils";

export type TechnicianRouteCardSummary = {
  primary: string;
  secondary: string;
  status?: string;
};

type TechnicianRouteCardProps = {
  name: string;
  selected?: boolean;
  summary: TechnicianRouteCardSummary;
  onClick: () => void;
};

function getStatusClassName(status?: string) {
  const normalizedStatus = status?.trim().toLocaleLowerCase("pt-BR") ?? "";

  if (normalizedStatus === "sem rotas planejadas") {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  if (/^\d+\s+dias?\s+planejados?$/.test(normalizedStatus)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function TechnicianRouteCard({ name, selected = false, summary, onClick }: TechnicianRouteCardProps) {
  return (
    <button type="button" onClick={onClick} className={`group h-full w-full rounded-2xl border bg-white p-4 text-left transition ${selected ? "border-sky-400 ring-2 ring-sky-100" : "border-slate-200 hover:border-sky-200 hover:shadow-sm"}`}>
      <div className="flex h-full items-start gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${selected ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-700"}`}>
          {technicianInitials(name)}
        </div>

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-slate-900">{name}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <UserRound className="h-3.5 w-3.5" />
                <span>{summary.primary}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">{summary.secondary}</div>
            </div>

            <ChevronRight className={`mt-1 h-4 w-4 shrink-0 transition ${selected ? "text-sky-600" : "text-slate-300 group-hover:text-sky-500"}`} />
          </div>

          {summary.status ? <span className={`mt-auto inline-flex self-start rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClassName(summary.status)}`}>{summary.status}</span> : null}
        </div>
      </div>
    </button>
  );
}