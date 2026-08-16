"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, MapPin, Plus, RefreshCcw, Route } from "lucide-react";
import { toast } from "sonner";

import { changeRouteEmployee, type RouteDashboardItem, type RouteTechnicianOption } from "@/app/(private)/routes/actions";
import { loadRouteWeek } from "@/app/(private)/routes/weekly-route-materialization.actions";

import RouteMapPanel from "@/components/routes/RouteMapPanel";
import RouteTechnicianWeekSelector from "@/components/routes/RouteTechnicianWeekSelector";
import { addDays, formatDate, getTechnicianDayMeta, getTechnicianRouteForDate, getTechnicianWeekMetrics, isRouteOrderCompleted, routeStatusClass, routeStatusLabel, startOfWeekMonday, toIsoDate } from "@/components/routes/routeWeek.utils";
import { Button } from "@/components/ui/button";

type RouteDashboardProps = {
  initialRoutes: RouteDashboardItem[];
  technicians: RouteTechnicianOption[];
};

export default function RouteDashboard({ initialRoutes, technicians }: RouteDashboardProps) {
  const router = useRouter();

  const todayIso = React.useMemo(() => toIsoDate(new Date()), []);
  const currentWeekStart = React.useMemo(() => toIsoDate(startOfWeekMonday(new Date())), []);

  const [routes, setRoutes] = React.useState<RouteDashboardItem[]>(initialRoutes);
  const [weekStartDate, setWeekStartDate] = React.useState(currentWeekStart);
  const [selectedDate, setSelectedDate] = React.useState(todayIso);
  const [loadingWeek, setLoadingWeek] = React.useState(false);

  const [technicianId, setTechnicianId] = React.useState(() => {
    const todayRoute = initialRoutes.find((route) => route.routeDate === todayIso);

    return todayRoute?.employeeUserId || technicians[0]?.id || "";
  });

  const [pendingEmployee, startEmployeeTransition] = React.useTransition();

  const loadedWeeksRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    setRoutes(initialRoutes);
  }, [initialRoutes]);

  React.useEffect(() => {
    if (!technicianId && technicians[0]?.id) {
      setTechnicianId(technicians[0].id);
    }
  }, [technicianId, technicians]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, [router]);

  const loadWeek = React.useCallback(async (weekStart: string, force = false) => {
    if (!force && loadedWeeksRef.current.has(weekStart)) {
      return;
    }

    loadedWeeksRef.current.add(weekStart);
    setLoadingWeek(true);

    const result = await loadRouteWeek({
      dateFrom: weekStart,
      dateTo: addDays(weekStart, 6),
    });

    setLoadingWeek(false);

    if (!result.ok) {
      loadedWeeksRef.current.delete(weekStart);

      toast.error(result.error || "Não foi possível sincronizar as rotas da semana.");

      return;
    }

    setRoutes(result.routes);
  }, []);

  React.useEffect(() => {
    void loadWeek(weekStartDate);
  }, [loadWeek, weekStartDate]);

  const selectedTechnician = React.useMemo(() => {
    return technicians.find((technician) => technician.id === technicianId) || null;
  }, [technicianId, technicians]);

  const technicianMetrics = React.useMemo(() => {
    return getTechnicianWeekMetrics(
      technicians,
      routes,
      weekStartDate,
    );
  }, [routes, technicians, weekStartDate]);

  const dayMeta = React.useMemo(() => {
    return getTechnicianDayMeta(
      routes,
      technicianId,
      weekStartDate,
    );
  }, [routes, technicianId, weekStartDate]);

  const selectedRoute = React.useMemo(() => {
    return getTechnicianRouteForDate(
      routes,
      technicianId,
      selectedDate,
    );
  }, [routes, selectedDate, technicianId]);

  const completedOrders = React.useMemo(() => {
    return selectedRoute?.serviceOrders.filter((order) => isRouteOrderCompleted(order.status)).length || 0;
  }, [selectedRoute]);

  function previousWeek() {
    const nextWeekStart = addDays(weekStartDate, -7);

    setWeekStartDate(nextWeekStart);
    setSelectedDate(nextWeekStart);
  }

  function currentWeek() {
    setWeekStartDate(currentWeekStart);
    setSelectedDate(todayIso);
  }

  function nextWeek() {
    const nextWeekStart = addDays(weekStartDate, 7);

    setWeekStartDate(nextWeekStart);
    setSelectedDate(nextWeekStart);
  }

  async function refreshCurrentWeek() {
    await loadWeek(
      weekStartDate,
      true,
    );
  }

  function selectTechnician(id: string) {
    setTechnicianId(id);

    const weekEnd = addDays(
      weekStartDate,
      6,
    );

    const firstRoute = routes
      .filter((route) => route.employeeUserId === id && route.routeDate >= weekStartDate && route.routeDate <= weekEnd)
      .sort((first, second) => first.routeDate.localeCompare(second.routeDate))[0];

    if (firstRoute) {
      setSelectedDate(firstRoute.routeDate);
    }
  }

  function changeEmployee(employeeUserId: string) {
    if (!selectedRoute || !employeeUserId) {
      return;
    }

    if (employeeUserId === selectedRoute.employeeUserId) {
      return;
    }

    const technician = technicians.find((item) => item.id === employeeUserId);

    startEmployeeTransition(async () => {
      try {
        await changeRouteEmployee({
          routeId: selectedRoute.id,
          employeeUserId,
        });

        setRoutes((current) =>
          current.map((route) =>
            route.id === selectedRoute.id
              ? {
                  ...route,
                  employeeUserId,
                  employeeName: technician?.name || route.employeeName,
                }
              : route,
          ),
        );

        setTechnicianId(employeeUserId);

        toast.success(
          "Técnico da rota atualizado.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o técnico.",
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <Route className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">Controle das rotas</h1>
              <p className="mt-1 text-sm text-slate-500">Acompanhe as rotas diárias e o andamento dos atendimentos.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-xl" disabled={loadingWeek} onClick={refreshCurrentWeek}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${loadingWeek ? "animate-spin" : ""}`} />
              {loadingWeek ? "Atualizando..." : "Atualizar"}
            </Button>

            <Button type="button" className="btn-brand rounded-xl text-white" onClick={() => router.push("/routes/builder")}>
              <Plus className="mr-2 h-4 w-4" />
              Planejar rotas
            </Button>
          </div>
        </div>
      </section>

      <RouteTechnicianWeekSelector
        technicians={technicians}
        technicianId={technicianId}
        technicianMetrics={technicianMetrics}
        weekStartDate={weekStartDate}
        selectedDate={selectedDate}
        todayIso={todayIso}
        dayMeta={dayMeta}
        onSelectTechnician={selectTechnician}
        onPreviousWeek={previousWeek}
        onCurrentWeek={currentWeek}
        onNextWeek={nextWeek}
        onSelectDate={setSelectedDate}
      />

      {selectedTechnician && (
        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {loadingWeek && !selectedRoute ? (
              <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div>
                  <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-sky-500" />

                  <h2 className="mt-3 text-sm font-semibold text-slate-700">
                    Preparando as rotas
                  </h2>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                    Estamos verificando o planejamento padrão e preparando as ocorrências desta semana.
                  </p>
                </div>
              </div>
            ) : !selectedRoute ? (
              <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div>
                  <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />

                  <h2 className="mt-3 text-sm font-semibold text-slate-700">
                    Nenhuma rota para {formatDate(selectedDate)}
                  </h2>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                    {selectedTechnician.name} não possui uma rota planejada para este dia.
                  </p>

                  <Button type="button" className="btn-brand mt-4 rounded-xl text-white" onClick={() => router.push("/routes/builder")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Abrir planejamento
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{selectedRoute.title}</h2>

                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${routeStatusClass(selectedRoute.status)}`}>
                        {routeStatusLabel(selectedRoute.status)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(selectedRoute.routeDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {completedOrders} de {selectedRoute.serviceOrderCount} concluídos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {selectedRoute.serviceOrders.map((order, index) => {
                    const completed = isRouteOrderCompleted(order.status);

                    return (
                      <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <div className="flex items-start gap-3">
                          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-white ${completed ? "bg-emerald-500" : "bg-sky-600"}`}>
                            {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-bold text-slate-900">
                                    {order.customerName}
                                  </h3>

                                  {typeof order.orderNumber === "number" && (
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                      OS {order.orderNumber}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 text-xs font-medium text-slate-600">
                                  {order.title}
                                </p>
                              </div>

                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${routeStatusClass(order.status)}`}>
                                {routeStatusLabel(order.status)}
                              </span>
                            </div>

                            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

                              <span>
                                {order.address || "Endereço não informado"}
                              </span>
                            </div>

                            {order.scheduledTime && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock3 className="h-3.5 w-3.5" />
                                {order.scheduledTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {selectedRoute.serviceOrders.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                      <Route className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Esta rota ainda não possui atendimentos
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Nenhuma OS está vinculada a esta rota.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <RouteMapPanel stops={selectedRoute?.serviceOrders || []} height={480} />
        </section>
      )}
    </div>
  );
}