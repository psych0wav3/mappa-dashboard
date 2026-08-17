"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CalendarDays, CheckCircle2, GripVertical, LoaderCircle, MapPin, Plus, RefreshCcw, Route, Save, Search, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { addOneTimeServiceOrderToDailyRoute, type AvailableRouteWorkOrder, type RouteDashboardItem, type RouteTechnicianOption } from "@/app/(private)/routes/actions";
import { listOneTimeServiceOrdersForDate, removeOneTimeOrderFromDailyRoute } from "@/app/(private)/routes/one-time-orders.actions";
import { getRouteOrder, saveRouteOrder } from "@/app/(private)/routes/route-order.actions";
import type { RouteOrderItem } from "@/app/(private)/routes/route-order.api";
import { loadRouteWeek } from "@/app/(private)/routes/weekly-route-materialization.actions";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RouteMapPanel from "@/components/routes/RouteMapPanel";
import RouteTechnicianWeekSelector from "@/components/routes/RouteTechnicianWeekSelector";
import { addDays, formatDate, getTechnicianDayMeta, getTechnicianRouteForDate, getTechnicianWeekMetrics, isRouteOrderCompleted, routeStatusClass, routeStatusLabel, startOfWeekMonday, toIsoDate } from "@/components/routes/routeWeek.utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RouteDashboardProps = {
  initialRoutes: RouteDashboardItem[];
  technicians: RouteTechnicianOption[];
};

function OneTimeOrdersPanel({
  orders,
  selectedDate,
  routeExists,
  addingOrderId,
  loading,
  disabled,
  search,
  onSearch,
  onAdd,
}: {
  orders: AvailableRouteWorkOrder[];
  selectedDate: string;
  routeExists: boolean;
  addingOrderId: string | null;
  loading: boolean;
  disabled: boolean;
  search: string;
  onSearch: (value: string) => void;
  onAdd: (order: AvailableRouteWorkOrder) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">OS avulsas do dia</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Ordens avulsas prontas para rota em {formatDate(selectedDate)}.</p>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)} placeholder="Buscar cliente ou serviço..." className="h-10 rounded-xl pl-9" />
      </div>

      {disabled ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
          Salve primeiro a nova ordem da rota antes de adicionar outra OS.
        </div>
      ) : null}

      <div className="mt-4 max-h-[310px] space-y-2.5 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-sky-500" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Buscando OS avulsas</p>
            <p className="mt-1 text-xs text-slate-400">Verificando as ordens disponíveis para {formatDate(selectedDate)}.</p>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-slate-900">{order.customerName}</h3>

                    {typeof order.orderNumber === "number" ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">OS {order.orderNumber}</span>
                    ) : null}

                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Avulsa</span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-slate-600">{order.title}</p>

                  <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                    <span>{order.address}</span>
                  </div>
                </div>

                <Button type="button" className="btn-brand h-9 shrink-0 rounded-xl px-3 text-xs text-white" disabled={disabled || addingOrderId === order.id} onClick={() => onAdd(order)}>
                  {addingOrderId === order.id ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
                  {routeExists ? "Adicionar" : "Criar rota"}
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Nenhuma OS avulsa para este dia</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">Não existem ordens avulsas prontas para rota em {formatDate(selectedDate)}.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RouteDashboard({ initialRoutes, technicians }: RouteDashboardProps) {
  const router = useRouter();

  const todayIso = React.useMemo(() => toIsoDate(new Date()), []);
  const currentWeekStart = React.useMemo(() => toIsoDate(startOfWeekMonday(new Date())), []);

  const [routes, setRoutes] = React.useState<RouteDashboardItem[]>(initialRoutes);
  const [oneTimeOrders, setOneTimeOrders] = React.useState<AvailableRouteWorkOrder[]>([]);
  const [loadingOneTimeOrders, setLoadingOneTimeOrders] = React.useState(false);
  const [weekStartDate, setWeekStartDate] = React.useState(currentWeekStart);
  const [selectedDate, setSelectedDate] = React.useState(todayIso);
  const [loadingWeek, setLoadingWeek] = React.useState(false);
  const [addingOrderId, setAddingOrderId] = React.useState<string | null>(null);
  const [removingOrderId, setRemovingOrderId] = React.useState<string | null>(null);
  const [oneTimeSearch, setOneTimeSearch] = React.useState("");

  const [routeOrderMeta, setRouteOrderMeta] = React.useState<RouteOrderItem[]>([]);
  const [draftOrderIds, setDraftOrderIds] = React.useState<string[]>([]);
  const [orderDirty, setOrderDirty] = React.useState(false);
  const [loadingRouteOrder, setLoadingRouteOrder] = React.useState(false);
  const [savingRouteOrder, setSavingRouteOrder] = React.useState(false);
  const [orderToRemove, setOrderToRemove] = React.useState<RouteDashboardItem["serviceOrders"][number] | null>(null);

  const [technicianId, setTechnicianId] = React.useState(() => {
    const todayRoute = initialRoutes.find((route) => route.routeDate === todayIso);
    return todayRoute?.employeeUserId || technicians[0]?.id || "";
  });

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
      if (!orderDirty && !removingOrderId) {
        router.refresh();
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [orderDirty, removingOrderId, router]);

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

  const loadOneTimeOrdersForDate = React.useCallback(async (date: string) => {
    setLoadingOneTimeOrders(true);

    const orders = await listOneTimeServiceOrdersForDate(date);

    setOneTimeOrders(orders);
    setLoadingOneTimeOrders(false);
  }, []);

  React.useEffect(() => {
    setOneTimeSearch("");
    void loadOneTimeOrdersForDate(selectedDate);
  }, [loadOneTimeOrdersForDate, selectedDate]);

  const selectedTechnician = React.useMemo(() => {
    return technicians.find((technician) => technician.id === technicianId) || null;
  }, [technicianId, technicians]);

  const technicianMetrics = React.useMemo(() => {
    return getTechnicianWeekMetrics(technicians, routes, weekStartDate);
  }, [routes, technicians, weekStartDate]);

  const dayMeta = React.useMemo(() => {
    return getTechnicianDayMeta(routes, technicianId, weekStartDate);
  }, [routes, technicianId, weekStartDate]);

  const selectedRoute = React.useMemo(() => {
    return getTechnicianRouteForDate(routes, technicianId, selectedDate);
  }, [routes, selectedDate, technicianId]);

  const selectedRouteIds = React.useMemo(() => {
    if (!selectedRoute) {
      return [];
    }

    return selectedRoute.sourceRouteIds.length > 0 ? selectedRoute.sourceRouteIds : [selectedRoute.id];
  }, [selectedRoute]);

  const hasConsolidatedRoutes = selectedRouteIds.length > 1;

  const selectedRouteSignature = React.useMemo(() => {
    if (!selectedRoute) {
      return "";
    }

    return `${selectedRouteIds.join("|")}::${selectedRoute.serviceOrders.map((order) => `${order.routeId}:${order.serviceOrderId}:${order.executionOrder}:${order.status}`).join("|")}`;
  }, [selectedRoute, selectedRouteIds]);

  React.useEffect(() => {
    let active = true;

    if (!selectedRoute) {
      setRouteOrderMeta([]);
      setDraftOrderIds([]);
      setOrderDirty(false);
      setLoadingRouteOrder(false);
      return;
    }

    setDraftOrderIds([...selectedRoute.serviceOrders].sort((first, second) => first.executionOrder - second.executionOrder).map((order) => order.serviceOrderId));
    setOrderDirty(false);
    setLoadingRouteOrder(true);

    void Promise.all(selectedRouteIds.map((routeId) => getRouteOrder(routeId))).then((results) => {
      if (!active) {
        return;
      }

      setLoadingRouteOrder(false);

      const failed = results.find((result) => !result.ok);

      if (failed) {
        setRouteOrderMeta(results.flatMap((result) => (result.ok ? result.serviceOrders : [])));
        toast.error(failed.error || "Não foi possível carregar todos os dados da rota.");
        return;
      }

      setRouteOrderMeta(results.flatMap((result) => result.serviceOrders));
    });

    return () => {
      active = false;
    };
  }, [selectedRouteSignature, selectedRouteIds]);

  const routeOrderMetaById = React.useMemo(() => {
    return new Map(routeOrderMeta.map((item) => [item.serviceOrderId, item]));
  }, [routeOrderMeta]);

  const orderedRouteOrders = React.useMemo(() => {
    if (!selectedRoute) {
      return [];
    }

    const byId = new Map(selectedRoute.serviceOrders.map((order) => [order.serviceOrderId, order]));

    return draftOrderIds.map((id) => byId.get(id)).filter((order): order is RouteDashboardItem["serviceOrders"][number] => Boolean(order));
  }, [draftOrderIds, selectedRoute]);

  const completedOrders = React.useMemo(() => {
    return selectedRoute?.serviceOrders.filter((order) => isRouteOrderCompleted(order.status)).length || 0;
  }, [selectedRoute]);

  const filteredOneTimeOrders = React.useMemo(() => {
    const term = oneTimeSearch.trim().toLocaleLowerCase("pt-BR");

    if (!term) {
      return oneTimeOrders;
    }

    return oneTimeOrders.filter((order) => `${order.customerName} ${order.title} ${order.address}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [oneTimeOrders, oneTimeSearch]);

  function confirmDiscardOrderChanges() {
    if (!orderDirty) {
      return true;
    }

    return window.confirm("Existem alterações não salvas na ordem desta rota. Deseja sair sem salvar?");
  }

  function previousWeek() {
    if (!confirmDiscardOrderChanges()) {
      return;
    }

    const nextWeekStart = addDays(weekStartDate, -7);

    setOrderDirty(false);
    setWeekStartDate(nextWeekStart);
    setSelectedDate(nextWeekStart);
  }

  function currentWeek() {
    if (!confirmDiscardOrderChanges()) {
      return;
    }

    setOrderDirty(false);
    setWeekStartDate(currentWeekStart);
    setSelectedDate(todayIso);
  }

  function nextWeek() {
    if (!confirmDiscardOrderChanges()) {
      return;
    }

    const nextWeekStart = addDays(weekStartDate, 7);

    setOrderDirty(false);
    setWeekStartDate(nextWeekStart);
    setSelectedDate(nextWeekStart);
  }

  function selectTechnician(id: string) {
    if (!confirmDiscardOrderChanges()) {
      return;
    }

    setOrderDirty(false);
    setTechnicianId(id);
  }

  function selectDate(date: string) {
    if (!confirmDiscardOrderChanges()) {
      return;
    }

    setOrderDirty(false);
    setSelectedDate(date);
  }

  async function refreshCurrentWeek() {
    if (!confirmDiscardOrderChanges()) {
      return;
    }

    setOrderDirty(false);
    loadedWeeksRef.current.delete(weekStartDate);

    await Promise.all([
      loadWeek(weekStartDate, true),
      loadOneTimeOrdersForDate(selectedDate),
    ]);

    router.refresh();
  }

  function moveRouteOrder(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= draftOrderIds.length) {
      return;
    }

    const next = [...draftOrderIds];

    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

    setDraftOrderIds(next);
    setOrderDirty(true);
  }

  async function persistRouteOrder() {
    if (!selectedRoute || !orderDirty) {
      return;
    }

    if (hasConsolidatedRoutes) {
      toast.error("Esta data possui rotas duplicadas consolidadas. A ordenação fica bloqueada até os registros antigos serem unificados.");
      return;
    }

    setSavingRouteOrder(true);

    const result = await saveRouteOrder(selectedRoute.id, draftOrderIds);

    setSavingRouteOrder(false);

    if (!result.ok) {
      toast.error(result.error || "Não foi possível salvar a ordem da rota.");
      return;
    }

    const executionOrderById = new Map(draftOrderIds.map((id, index) => [id, index + 1]));

    setRoutes((current) =>
      current.map((route) => {
        if (route.id !== selectedRoute.id) {
          return route;
        }

        return {
          ...route,
          serviceOrders: [...route.serviceOrders]
            .map((order) => ({
              ...order,
              executionOrder: executionOrderById.get(order.serviceOrderId) || order.executionOrder,
            }))
            .sort((first, second) => first.executionOrder - second.executionOrder),
        };
      }),
    );

    setRouteOrderMeta(result.serviceOrders);
    setOrderDirty(false);

    toast.success("Ordem da rota atualizada.");
  }

  async function addOneTimeOrder(order: AvailableRouteWorkOrder) {
    if (orderDirty) {
      toast.error("Salve primeiro a nova ordem da rota.");
      return;
    }

    if (!selectedTechnician) {
      toast.error("Selecione um técnico.");
      return;
    }

    setAddingOrderId(order.id);

    const result = await addOneTimeServiceOrderToDailyRoute({
      serviceOrderId: order.id,
      routeDate: selectedDate,
      employeeUserId: selectedTechnician.id,
      employeeName: selectedTechnician.name,
    });

    setAddingOrderId(null);

    if (!result.ok || !result.route) {
      toast.error(result.error || "Não foi possível adicionar a OS à rota.");
      return;
    }

    setOrderDirty(false);
    loadedWeeksRef.current.delete(weekStartDate);

    await Promise.all([
      loadWeek(weekStartDate, true),
      loadOneTimeOrdersForDate(selectedDate),
    ]);

    toast.success(
      selectedRoute
        ? `${order.customerName} adicionado à rota de ${selectedTechnician.name}.`
        : `Rota de ${formatDate(selectedDate)} criada para ${selectedTechnician.name}.`,
    );

    router.refresh();
  }

  async function removeOneTimeOrder() {
    if (!selectedRoute || !orderToRemove) {
      return;
    }

    const order = orderToRemove;

    if (orderDirty) {
      toast.error("Salve primeiro a nova ordem da rota.");
      return;
    }

    setRemovingOrderId(order.serviceOrderId);

    const result = await removeOneTimeOrderFromDailyRoute({
      routeId: order.routeId || selectedRoute.id,
      serviceOrderId: order.serviceOrderId,
    });

    setRemovingOrderId(null);

    if (!result.ok) {
      toast.error(result.error || "Não foi possível retirar a OS da rota.");
      return;
    }

    setOrderToRemove(null);
    setOrderDirty(false);
    loadedWeeksRef.current.delete(weekStartDate);

    await Promise.all([
      loadWeek(weekStartDate, true),
      loadOneTimeOrdersForDate(selectedDate),
    ]);

    toast.success(
      result.routeDeleted
        ? "OS devolvida para as disponíveis. A rota vazia foi removida."
        : "OS retirada da rota e devolvida para as disponíveis.",
    );

    router.refresh();
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
              <p className="mt-1 text-sm text-slate-500">Acompanhe as rotas recorrentes, encaixe as OS avulsas e organize a sequência de execução.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-xl" disabled={loadingWeek || orderDirty} onClick={refreshCurrentWeek}>
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

      <RouteTechnicianWeekSelector technicians={technicians} technicianId={technicianId} technicianMetrics={technicianMetrics} weekStartDate={weekStartDate} selectedDate={selectedDate} todayIso={todayIso} dayMeta={dayMeta} onSelectTechnician={selectTechnician} onPreviousWeek={previousWeek} onCurrentWeek={currentWeek} onNextWeek={nextWeek} onSelectDate={selectDate} />

      {selectedTechnician ? (
        <section className="grid items-stretch gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {loadingWeek && !selectedRoute ? (
              <div className="grid min-h-[420px] flex-1 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div>
                  <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-sky-500" />
                  <h2 className="mt-3 text-sm font-semibold text-slate-700">Preparando as rotas</h2>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">Estamos verificando o planejamento padrão e preparando as ocorrências desta semana.</p>
                </div>
              </div>
            ) : !selectedRoute ? (
              <div className="grid min-h-[420px] flex-1 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div>
                  <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                  <h2 className="mt-3 text-sm font-semibold text-slate-700">Nenhuma rota para {formatDate(selectedDate)}</h2>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">{selectedTechnician.name} não possui uma rota recorrente para este dia.</p>

                  {!loadingOneTimeOrders && oneTimeOrders.length > 0 ? (
                    <p className="mx-auto mt-2 max-w-sm text-xs font-medium text-sky-700">
                      Há {oneTimeOrders.length} {oneTimeOrders.length === 1 ? "OS avulsa disponível" : "OS avulsas disponíveis"} para esta data. Adicione uma pelo painel ao lado para criar a rota.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{selectedRoute.title}</h2>

                      {orderDirty ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                          Alterações não salvas
                        </span>
                      ) : null}

                      {hasConsolidatedRoutes ? (
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                          {selectedRouteIds.length} rotas consolidadas
                        </span>
                      ) : null}
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

                  {orderDirty ? (
                    <Button type="button" className="btn-brand shrink-0 rounded-xl text-white" disabled={savingRouteOrder} onClick={persistRouteOrder}>
                      {savingRouteOrder ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {savingRouteOrder ? "Salvando..." : "Salvar ordem"}
                    </Button>
                  ) : null}
                </div>

                <div className="mt-4 space-y-2.5">
                  {orderedRouteOrders.map((order, index) => {
                    const completed = isRouteOrderCompleted(order.status);
                    const metadata = routeOrderMetaById.get(order.serviceOrderId);
                    const recurring = metadata?.isRecurring === true;
                    const oneTime = metadata?.isRecurring === false;
                    const removing = removingOrderId === order.serviceOrderId;

                    return (
                      <article key={order.serviceOrderId} className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="flex shrink-0 items-center gap-2">
                            <GripVertical className="h-5 w-5 text-slate-300" />

                            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-white ${completed ? "bg-emerald-500" : "bg-sky-600"}`}>
                              {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-bold text-slate-900">{order.customerName}</h3>

                                  {typeof order.orderNumber === "number" ? (
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">OS {order.orderNumber}</span>
                                  ) : null}

                                  {!loadingRouteOrder && metadata ? (
                                    recurring ? (
                                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">Recorrente</span>
                                    ) : (
                                      <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Avulsa</span>
                                    )
                                  ) : null}
                                </div>

                                <p className="mt-0.5 text-xs font-medium text-slate-600">{order.title}</p>

                                <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                                  <span>{order.address || "Endereço não informado"}</span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1">
                                <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0" disabled={hasConsolidatedRoutes || index === 0 || savingRouteOrder || Boolean(removingOrderId)} onClick={() => moveRouteOrder(index, -1)} title="Mover para cima">
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>

                                <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0" disabled={hasConsolidatedRoutes || index === orderedRouteOrders.length - 1 || savingRouteOrder || Boolean(removingOrderId)} onClick={() => moveRouteOrder(index, 1)} title="Mover para baixo">
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>

                                {oneTime ? (
                                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-lg border-violet-200 p-0 text-violet-600 hover:bg-violet-50 hover:text-violet-700" disabled={orderDirty || savingRouteOrder || Boolean(removingOrderId)} onClick={() => setOrderToRemove(order)} title="Retirar da rota">
                                    {removing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                                  </Button>
                                ) : null}

                                <span className={`ml-1 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${routeStatusClass(order.status)}`}>
                                  {routeStatusLabel(order.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <OneTimeOrdersPanel orders={filteredOneTimeOrders} selectedDate={selectedDate} routeExists={Boolean(selectedRoute)} addingOrderId={addingOrderId} loading={loadingOneTimeOrders} disabled={orderDirty || Boolean(removingOrderId)} search={oneTimeSearch} onSearch={setOneTimeSearch} onAdd={addOneTimeOrder} />

            <RouteMapPanel stops={orderedRouteOrders} height={330} />
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={Boolean(orderToRemove)}
        tone="warning"
        title="Retirar OS da rota?"
        description={
          orderToRemove ? (
            <>
              <p>
                A OS <strong className="font-semibold text-slate-700">{orderToRemove.orderNumber ? `#${orderToRemove.orderNumber}` : orderToRemove.title}</strong> de <strong className="font-semibold text-slate-700">{orderToRemove.customerName}</strong> será retirada desta rota.
              </p>

              <p className="mt-2">
                Ela voltará para as OS avulsas disponíveis de <strong className="font-semibold text-slate-700">{formatDate(selectedDate)}</strong>.
              </p>
            </>
          ) : null
        }
        confirmLabel="Retirar da rota"
        cancelLabel="Manter na rota"
        loading={Boolean(removingOrderId)}
        onCancel={() => {
          if (!removingOrderId) {
            setOrderToRemove(null);
          }
        }}
        onConfirm={removeOneTimeOrder}
      />
    </div>
  );
}