"use client";

import * as React from "react";

import {
  Search,
} from "lucide-react";

import type {
  RouteTechnicianOption,
} from "@/app/(private)/routes/routes.types";

import {
  Input,
} from "@/components/ui/input";

import TechnicianRouteCard, {
  type TechnicianRouteCardSummary,
} from "./TechnicianRouteCard";

type RouteTechnicianSelectorProps = {
  technicians:
    RouteTechnicianOption[];

  technicianId: string;

  summaries: Record<
    string,
    TechnicianRouteCardSummary
  >;

  onSelectTechnician: (
    technicianId: string,
  ) => void;
};

const EMPTY_SUMMARY: TechnicianRouteCardSummary =
  {
    primary:
      "0 atendimentos na semana",

    secondary:
      "0 dias com rota",

    status:
      "Sem planejamento",
  };

export default function RouteTechnicianSelector({
  technicians,
  technicianId,
  summaries,
  onSelectTechnician,
}: RouteTechnicianSelectorProps) {
  const [
    search,
    setSearch,
  ] = React.useState("");

  const visibleTechnicians =
    React.useMemo(() => {
      const term = search
        .trim()
        .toLocaleLowerCase(
          "pt-BR",
        );

      if (!term) {
        return technicians;
      }

      return technicians.filter(
        (technician) =>
          technician.name
            .toLocaleLowerCase(
              "pt-BR",
            )
            .includes(term),
      );
    }, [
      search,
      technicians,
    ]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Técnicos
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Selecione um técnico para visualizar a rotina de rotas dele.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar técnico..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
      </div>

      {visibleTechnicians.length >
      0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleTechnicians.map(
            (
              technician,
            ) => (
              <TechnicianRouteCard
                key={
                  technician.id
                }
                name={
                  technician.name
                }
                selected={
                  technician.id ===
                  technicianId
                }
                summary={
                  summaries[
                    technician.id
                  ] ??
                  EMPTY_SUMMARY
                }
                onClick={() =>
                  onSelectTechnician(
                    technician.id,
                  )
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
          Nenhum técnico encontrado.
        </div>
      )}
    </section>
  );
}