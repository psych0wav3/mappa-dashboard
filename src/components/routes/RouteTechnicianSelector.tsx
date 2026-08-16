"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import type { RouteTechnicianOption } from "@/app/(private)/routes/routes.types";

import { Input } from "@/components/ui/input";

import TechnicianRouteCard, { type TechnicianRouteCardSummary } from "./TechnicianRouteCard";

type RouteTechnicianSelectorProps = {
  technicians: RouteTechnicianOption[];
  technicianId: string;
  summaries: Record<string, TechnicianRouteCardSummary>;
  onSelectTechnician: (technicianId: string) => void;
};

const EMPTY_SUMMARY: TechnicianRouteCardSummary = {
  primary: "0 atendimentos na semana",
  secondary: "0 dias com rota",
  status: "Sem rotas planejadas",
};

const ROW_SCROLL_DISTANCE = 134;

export default function RouteTechnicianSelector({ technicians, technicianId, summaries, onSelectTechnician }: RouteTechnicianSelectorProps) {
  const [search, setSearch] = React.useState("");
  const [hasOverflow, setHasOverflow] = React.useState(false);
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const visibleTechnicians = React.useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    if (!term) {
      return technicians;
    }

    return technicians.filter((technician) => technician.name.toLocaleLowerCase("pt-BR").includes(term));
  }, [search, technicians]);

  const updateScrollState = React.useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      setHasOverflow(false);
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const overflow = maxScrollTop > 2;

    setHasOverflow(overflow);
    setCanScrollUp(overflow && container.scrollTop > 2);
    setCanScrollDown(overflow && container.scrollTop < maxScrollTop - 2);
  }, []);

  React.useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: 0,
      behavior: "auto",
    });

    const frame = window.requestAnimationFrame(updateScrollState);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(container);

    const grid = container.firstElementChild;

    if (grid instanceof HTMLElement) {
      resizeObserver.observe(grid);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, visibleTechnicians]);

  function scrollTechnicians(direction: "up" | "down") {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      top: direction === "down" ? ROW_SCROLL_DISTANCE : -ROW_SCROLL_DISTANCE,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 350);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Técnicos</h2>
          <p className="mt-1 text-xs text-slate-500">Selecione um técnico para visualizar a rotina de rotas dele.</p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar técnico..." className="h-10 rounded-xl pl-9" />
        </div>
      </div>

      {visibleTechnicians.length > 0 ? (
        <div className="relative mt-4">
          <div ref={scrollRef} onScroll={updateScrollState} className={`max-h-[260px] overflow-y-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${hasOverflow ? "pr-14" : "pr-1"}`}>
            <div className="grid auto-rows-[122px] gap-3 p-0.5 md:grid-cols-2 xl:grid-cols-4">
              {visibleTechnicians.map((technician) => (
                <TechnicianRouteCard
                  key={technician.id}
                  name={technician.name}
                  selected={technician.id === technicianId}
                  summary={summaries[technician.id] ?? EMPTY_SUMMARY}
                  onClick={() => onSelectTechnician(technician.id)}
                />
              ))}
            </div>
          </div>

          {hasOverflow ? (
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-14 items-center justify-center bg-gradient-to-l from-white via-white to-white/70">
              <div className="pointer-events-auto flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => scrollTechnicians("up")}
                  disabled={!canScrollUp}
                  title="Ver técnicos acima"
                  aria-label="Ver técnicos acima"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 disabled:cursor-default disabled:text-slate-200 disabled:hover:bg-transparent"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>

                <div className="mx-auto h-px w-5 bg-slate-100" />

                <button
                  type="button"
                  onClick={() => scrollTechnicians("down")}
                  disabled={!canScrollDown}
                  title="Ver mais técnicos"
                  aria-label="Ver mais técnicos"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 disabled:cursor-default disabled:text-slate-200 disabled:hover:bg-transparent"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
          Nenhum técnico encontrado.
        </div>
      )}
    </section>
  );
}