"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  MapPin,
  Plus,
  RefreshCcw,
  Route,
  Search,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  RouteDashboardItem,
  RouteTechnicianOption,
} from "@/app/(private)/routes/actions";

const WEEKDAYS = [
  { index: 1, short: "Seg", label: "Segunda" },
  { index: 2, short: "Ter", label: "Terça" },
  { index: 3, short: "Qua", label: "Quarta" },
  { index: 4, short: "Qui", label: "Quinta" },
  { index: 5, short: "Sex", label: "Sexta" },
  { index: 6, short: "Sáb", label: "Sábado" },
  { index: 0, short: "Dom", label: "Domingo" },
];

function normalizeStatus(status?: string | null) {
  return String(status || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
}

function statusLabel(status?: string | null) {
  const normalized = normalizeStatus(status);

  const map: Record<string, string> = {
    planned: "Planejada",
    inprogress: "Em andamento",
    inroute: "Em rota",
    finished: "Finalizada",
    done: "Finalizada",
    canceled: "Cancelada",
    cancelled: "Cancelada",
    rejected: "Recusada",
  };

  return map[normalized] || status || "Status não informado";
}

function statusClass(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "planned") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (normalized === "inprogress" || normalized === "inroute") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized === "finished" || normalized === "done") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "canceled" ||
    normalized === "cancelled" ||
    normalized === "rejected"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function toIsoDate(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);

  const offset = copy.getTimezoneOffset();
  const local = new Date(copy.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 10);
}

function startOfWeekMonday(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);

  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);

  return copy;
}

function addDays(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() + days);

  return toIsoDate(date);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = String(value).slice(0, 10);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatDayMonth(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}`;
}

function formatWeekLabel(weekStartIso: string) {
  const end = addDays(weekStartIso, 6);

  return `${formatDayMonth(weekStartIso)} a ${formatDayMonth(end)}`;
}

function getWeekDays(weekStartIso: string) {
  return WEEKDAYS.map((weekday, offset) => {
    const date = addDays(weekStartIso, offset);

    return {
      ...weekday,
      date,
    };
  });
}

function sameDate(a?: string | null, b?: string | null) {
  if (!a || !b) return false;

  return String(a).slice(0, 10) === String(b).slice(0, 10);
}

export default function RouteDashboard({
  initialRoutes,
  technicians,
}: {
  initialRoutes: RouteDashboardItem[];
  technicians: RouteTechnicianOption[];
}) {
  const router = useRouter();

  const todayIso = React.useMemo(() => toIsoDate(new Date()), []);

  const [q, setQ] = React.useState("");
  const [technicianId, setTechnicianId] = React.useState("");
  const [weekStartDate, setWeekStartDate] = React.useState(() =>
    toIsoDate(startOfWeekMonday(new Date())),
  );
  const [selectedDate, setSelectedDate] = React.useState(todayIso);
  const [selectedRouteId, setSelectedRouteId] = React.useState("");

  const weekDays = React.useMemo(
    () => getWeekDays(weekStartDate),
    [weekStartDate],
  );

  const selectedDayRoutes = React.useMemo(() => {
    const term = q.trim().toLowerCase();

    return initialRoutes
      .filter((route) => sameDate(route.routeDate, selectedDate))
      .filter((route) => {
        if (!technicianId) return true;

        return route.employeeUserId === technicianId;
      })
      .filter((route) => {
        if (!term) return true;

        return [
          route.title,
          route.employeeName,
          route.routeDate,
          formatDate(route.routeDate),
          route.status,
          statusLabel(route.status),
          ...route.serviceOrders.map((order) => order.customerName),
          ...route.serviceOrders.map((order) => order.address),
          ...route.serviceOrders.map((order) => order.title),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName, "pt-BR"));
  }, [initialRoutes, selectedDate, technicianId, q]);

  const selectedRoute = React.useMemo(
    () =>
      selectedDayRoutes.find((route) => route.id === selectedRouteId) ||
      selectedDayRoutes[0] ||
      null,
    [selectedDayRoutes, selectedRouteId],
  );

  React.useEffect(() => {
    if (!selectedDayRoutes.length) {
      setSelectedRouteId("");
      return;
    }

    if (!selectedDayRoutes.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(selectedDayRoutes[0].id);
    }
  }, [selectedDayRoutes, selectedRouteId]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [router]);

  const routesByDate = React.useMemo(() => {
    const map = new Map<string, RouteDashboardItem[]>();

    for (const route of initialRoutes) {
      const date = String(route.routeDate || "").slice(0, 10);

      if (!date) continue;

      const current = map.get(date) || [];
      current.push(route);
      map.set(date, current);
    }

    return map;
  }, [initialRoutes]);

  const totalRoutesInDay = selectedDayRoutes.length;

  const totalOrdersInDay = selectedDayRoutes.reduce(
    (sum, route) => sum + route.serviceOrderCount,
    0,
  );

  const totalTechniciansInDay = new Set(
    selectedDayRoutes.map((route) => route.employeeUserId).filter(Boolean),
  ).size;

  function handlePreviousWeek() {
    const previous = addDays(weekStartDate, -7);
    setWeekStartDate(previous);
    setSelectedDate(previous);
    setSelectedRouteId("");
  }

  function handleCurrentWeek() {
    const currentWeekStart = toIsoDate(startOfWeekMonday(new Date()));
    setWeekStartDate(currentWeekStart);
    setSelectedDate(todayIso);
    setSelectedRouteId("");
  }

  function handleNextWeek() {
    const next = addDays(weekStartDate, 7);
    setWeekStartDate(next);
    setSelectedDate(next);
    setSelectedRouteId("");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-3 lg:grid-cols-[1fr_260px_310px]">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Buscar rota
                </label>

                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Buscar por técnico, cliente, data ou endereço..."
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Técnico
                </label>

                <select
                  value={technicianId}
                  onChange={(event) => {
                    setTechnicianId(event.target.value);
                    setSelectedRouteId("");
                  }}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Todos os técnicos</option>

                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Semana
                </label>

                <div className="mt-1 flex h-10 overflow-hidden rounded-md border border-slate-300 bg-white">
                  <button
                    type="button"
                    onClick={handlePreviousWeek}
                    className="flex w-10 items-center justify-center border-r text-slate-600 hover:bg-slate-50"
                    title="Semana anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCurrentWeek}
                    className="flex flex-1 items-center justify-center px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    title="Voltar para semana atual"
                  >
                    {formatWeekLabel(weekStartDate)}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="flex w-10 items-center justify-center border-l text-slate-600 hover:bg-slate-50"
                    title="Próxima semana"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => router.refresh()}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>

              <Button
                type="button"
                className="h-10 btn-brand text-white"
                onClick={() => router.push("/routes/builder")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar rota
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-7">
            {weekDays.map((day) => {
              const selected = day.date === selectedDate;
              const isToday = day.date === todayIso;

              const count = routesByDate.get(day.date)?.length || 0;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedRouteId("");
                  }}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-sky-400 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        selected ? "text-sky-700" : "text-slate-700"
                      }`}
                    >
                      {day.short}
                    </span>

                    {isToday && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {formatDayMonth(day.date)}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {count} rota{count === 1 ? "" : "s"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">Rotas no dia</div>
              <div className="mt-1 font-semibold text-slate-900">
                {totalRoutesInDay}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">OS no dia</div>
              <div className="mt-1 font-semibold text-slate-900">
                {totalOrdersInDay}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">Técnicos no dia</div>
              <div className="mt-1 font-semibold text-slate-900">
                {totalTechniciansInDay}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Route className="h-4 w-4 text-sky-600" />

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Rotas de {formatDate(selectedDate)}
              </h2>
              <p className="text-xs text-slate-500">
                Visualização por dia, técnico e status atual.
              </p>
            </div>
          </div>

          <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {selectedDayRoutes.map((route) => {
              const selected = route.id === selectedRoute?.id;

              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {route.title}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <UserRound className="h-3.5 w-3.5" />
                        <span className="truncate">{route.employeeName}</span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusClass(
                        route.status,
                      )}`}
                    >
                      {statusLabel(route.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(route.routeDate)}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5" />
                      {route.serviceOrderCount} OS
                    </span>
                  </div>
                </button>
              );
            })}

            {selectedDayRoutes.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Nenhuma rota encontrada para este dia.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {!selectedRoute ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Selecione uma rota para visualizar os detalhes.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {selectedRoute.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(selectedRoute.routeDate)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-4 w-4" />
                      {selectedRoute.employeeName}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Status atualizado ao carregar/atualizar
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                    selectedRoute.status,
                  )}`}
                >
                  {statusLabel(selectedRoute.status)}
                </span>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Ordens da rota
                </h3>

                <div className="space-y-2">
                  {selectedRoute.serviceOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-xs font-semibold text-white">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {order.customerName}
                              </div>

                              <div className="mt-0.5 text-sm text-slate-700">
                                {order.title}
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusClass(
                                order.status,
                              )}`}
                            >
                              {statusLabel(order.status)}
                            </span>
                          </div>

                          <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                            <span className="truncate">{order.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedRoute.serviceOrders.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Esta rota ainda não possui OS vinculadas.
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Mapa da rota
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualização ilustrativa dos pontos desta rota.
                  </p>
                </div>

                <div className="relative h-[340px] overflow-hidden bg-[linear-gradient(135deg,#dff8e8_0%,#dff8e8_35%,#d8eefc_35%,#d8eefc_50%,#f4f9ff_50%,#f4f9ff_100%)]">
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute left-[4%] top-[20%] h-[2px] w-[92%] rotate-6 bg-slate-400" />
                    <div className="absolute left-[8%] top-[70%] h-[2px] w-[86%] -rotate-6 bg-slate-400" />
                    <div className="absolute left-[22%] top-0 h-full w-[2px] rotate-12 bg-slate-400" />
                    <div className="absolute left-[58%] top-0 h-full w-[2px] -rotate-12 bg-slate-400" />
                  </div>

                  {selectedRoute.serviceOrders.map((order, index) => {
                    const positions = [
                      { left: "47%", top: "46%" },
                      { left: "55%", top: "36%" },
                      { left: "39%", top: "58%" },
                      { left: "66%", top: "54%" },
                      { left: "34%", top: "36%" },
                      { left: "51%", top: "68%" },
                    ];

                    const pos = positions[index % positions.length];

                    return (
                      <div
                        key={order.id}
                        className="absolute"
                        style={{
                          left: pos.left,
                          top: pos.top,
                          transform: "translate(-50%, -50%)",
                        }}
                        title={order.customerName}
                      >
                        <div className="group relative">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-xs font-bold text-white shadow-lg">
                            {index + 1}
                          </div>

                          <div className="pointer-events-none absolute left-1/2 top-11 z-10 hidden w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg group-hover:block">
                            <div className="font-semibold text-slate-900">
                              {order.customerName}
                            </div>

                            <div className="mt-1 text-slate-600">
                              {order.title}
                            </div>

                            <div className="mt-1 truncate text-slate-500">
                              {order.address}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedRoute.serviceOrders.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
                        Nenhum ponto para exibir no mapa.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}