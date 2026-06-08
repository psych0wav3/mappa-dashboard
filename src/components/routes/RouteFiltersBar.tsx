"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserRound,
} from "lucide-react";

import { type RouteTechnician } from "@/components/routes/routeBuilderMockTypes";

function TechnicianSearchSelect({
  technicians,
  value,
  onChange,
}: {
  technicians: RouteTechnician[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const selectedTechnician =
    technicians.find((technician) => technician.id === value) || null;

  const filteredTechnicians = React.useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return technicians;

    return technicians.filter((technician) =>
      technician.name.toLowerCase().includes(term),
    );
  }, [query, technicians]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  function handleOpen() {
    setOpen(true);
    setQuery("");
  }

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search
          size={14}
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition ${
            open ? "text-slate-400" : "text-transparent"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={
            open ? query : selectedTechnician ? selectedTechnician.name : ""
          }
          readOnly={!open}
          onClick={handleOpen}
          onFocus={handleOpen}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={open ? "Pesquisar técnico..." : "Selecione um técnico..."}
          className={`h-9 w-full rounded-md border border-slate-300 bg-white pr-9 text-xs outline-none transition hover:bg-slate-50 focus:border-sky-400 ${
            open ? "pl-8" : "pl-3"
          }`}
        />

        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="max-h-52 overflow-y-auto p-1">
            {filteredTechnicians.map((technician) => {
              const selected = technician.id === value;

              return (
                <button
                  key={technician.id}
                  type="button"
                  onClick={() => handleSelect(technician.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition ${
                    selected
                      ? "bg-sky-50 text-sky-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{technician.name}</span>

                  {selected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}

            {filteredTechnicians.length === 0 && (
              <div className="px-3 py-5 text-center text-xs text-slate-500">
                Nenhum técnico encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RouteFiltersBar({
  technicians,
  technicianId,
  onTechnicianChange,
  weekLabel,
  onPreviousWeek,
  onCurrentWeek,
  onNextWeek,
  search,
  onSearchChange,
}: {
  technicians: RouteTechnician[];
  technicianId: string;
  onTechnicianChange: (id: string) => void;
  weekLabel: string;
  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[360px_310px_1fr] xl:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5 text-sky-600" />

            <div className="flex min-w-0 items-center gap-1.5">
            <label className="shrink-0 text-xs font-semibold text-slate-800">
              Técnico responsável
            </label>

            <span className="truncate text-[11px] leading-4 text-slate-500">
              • Pesquise e selecione para esta rota.
            </span>
          </div>
          </div>

          <TechnicianSearchSelect
            technicians={technicians}
            value={technicianId}
            onChange={onTechnicianChange}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-800">
            Semana
          </label>

          <div className="flex h-9 overflow-hidden rounded-md border border-slate-300 bg-white">
            <button
              type="button"
              onClick={onPreviousWeek}
              className="flex w-9 items-center justify-center border-r text-slate-600 hover:bg-slate-50"
              title="Semana anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onCurrentWeek}
              className="min-w-0 flex-1 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              title="Voltar para semana atual"
            >
              {weekLabel}
            </button>

            <button
              type="button"
              onClick={onNextWeek}
              className="flex w-9 items-center justify-center border-l text-slate-600 hover:bg-slate-50"
              title="Próxima semana"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-800">
            Buscar OS
          </label>

          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por cliente, endereço, serviço ou dia."
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-xs outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}