"use client";

import {
  Search,
  UserCheck,
  UserX,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import type {
  TechnicianCounts,
  TechnicianTab,
} from "./technician.types";

type TechnicianFiltersProps = {
  tab: TechnicianTab;
  query: string;
  counts: TechnicianCounts;
  onTabChange: (
    tab: TechnicianTab,
  ) => void;
  onQueryChange: (
    query: string,
  ) => void;
};

function tabButtonClass(
  selected: boolean,
) {
  return [
    "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
    selected
      ? "border-sky-600 bg-sky-600 text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
  ].join(" ");
}

export default function TechnicianFilters({
  tab,
  query,
  counts,
  onTabChange,
  onQueryChange,
}: TechnicianFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onTabChange("active")} className={tabButtonClass(tab === "active")}>
          <UserCheck className="h-4 w-4" />
          Ativos ({counts.active})
        </button>

        <button type="button" onClick={() => onTabChange("inactive")} className={tabButtonClass(tab === "inactive")}>
          <UserX className="h-4 w-4" />
          Inativos ({counts.inactive})
        </button>
      </div>

      <div className="relative w-full lg:w-[420px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar por nome, e-mail ou telefone..." className="h-10 rounded-xl pl-10" />
      </div>
    </div>
  );
}