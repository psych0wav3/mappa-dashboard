"use client";

import * as React from "react";

import type {
  RouteTechnicianOption,
} from "@/app/(private)/routes/routes.types";

import RouteTechnicianSelector from "./RouteTechnicianSelector";

import RouteWeekStrip from "./RouteWeekStrip";

import type {
  RouteDayMeta,
  TechnicianWeekMetric,
} from "./routeWeek.utils";

type RouteTechnicianWeekSelectorProps = {
  technicians:
    RouteTechnicianOption[];

  technicianId: string;

  technicianMetrics: Record<
    string,
    TechnicianWeekMetric
  >;

  weekStartDate: string;
  selectedDate: string;
  todayIso: string;

  dayMeta: Record<
    string,
    RouteDayMeta
  >;

  onSelectTechnician: (
    technicianId: string,
  ) => void;

  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;

  onSelectDate: (
    date: string,
  ) => void;
};

export default function RouteTechnicianWeekSelector({
  technicians,
  technicianId,
  technicianMetrics,
  weekStartDate,
  selectedDate,
  todayIso,
  dayMeta,
  onSelectTechnician,
  onPreviousWeek,
  onCurrentWeek,
  onNextWeek,
  onSelectDate,
}: RouteTechnicianWeekSelectorProps) {
  const summaries =
    React.useMemo(() => {
      return Object.fromEntries(
        technicians.map(
          (
            technician,
          ) => {
            const metric =
              technicianMetrics[
                technician.id
              ] ?? {
                routes: 0,
                orders: 0,
                completed: 0,
              };

            const progress =
              metric.orders > 0
                ? `${metric.completed}/${metric.orders} concluídos`
                : "Sem atendimentos na semana";

            return [
              technician.id,

              {
                primary: `${
                  metric.orders
                } ${
                  metric.orders ===
                  1
                    ? "atendimento"
                    : "atendimentos"
                } na semana`,

                secondary: `${
                  metric.routes
                } ${
                  metric.routes ===
                  1
                    ? "dia com rota"
                    : "dias com rota"
                }`,

                status:
                  progress,
              },
            ];
          },
        ),
      );
    }, [
      technicianMetrics,
      technicians,
    ]);

  return (
    <div className="space-y-5">
      <RouteTechnicianSelector
        technicians={
          technicians
        }
        technicianId={
          technicianId
        }
        summaries={
          summaries
        }
        onSelectTechnician={
          onSelectTechnician
        }
      />

      <RouteWeekStrip
        weekStartDate={
          weekStartDate
        }
        selectedDate={
          selectedDate
        }
        todayIso={
          todayIso
        }
        dayMeta={
          dayMeta
        }
        countLabel="atendimentos"
        onPreviousWeek={
          onPreviousWeek
        }
        onCurrentWeek={
          onCurrentWeek
        }
        onNextWeek={
          onNextWeek
        }
        onSelectDate={
          onSelectDate
        }
      />
    </div>
  );
}