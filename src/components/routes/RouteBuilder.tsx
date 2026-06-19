"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import RouteFiltersBar from "@/components/routes/RouteFiltersBar";
import WeeklyTechnicianBoard from "@/components/routes/WeeklyTechnicianBoard";
import AvailableWorkOrdersCard from "@/components/routes/AvailableWorkOrdersCard";
import FullWidthRouteMap from "@/components/routes/FullWidthRouteMap";

import {
  createWeeklyRoutesFromPlanner,
  type AvailableRouteWorkOrder,
  type RouteTechnicianOption,
} from "@/app/(private)/routes/actions";

import {
  type AvailableWorkOrder,
  type PlannedRouteOrder,
  type RouteTechnician,
  type RouteWeekday,
  generateId,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

type BuilderWorkOrder = AvailableWorkOrder & {
  scheduledDate?: string | null;
  weekdaysLabel?: string | null;
  totalAmount?: number | null;
  technicianId?: string | null;
  technicianName?: string | null;
};

type BuilderPlannedRouteOrder = PlannedRouteOrder & {
  scheduledDate?: string | null;
  weekdaysLabel?: string | null;
  totalAmount?: number | null;
  technicianName?: string | null;
};

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

function formatWeekLabel(weekStartIso: string) {
  const start = new Date(`${weekStartIso}T00:00:00`);
  const end = new Date(start);

  end.setDate(end.getDate() + 6);

  const startText = start.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  const endText = end.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return `${startText} a ${endText}`;
}

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = String(value).slice(0, 10);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function normalizeTechnicians(
  technicians: RouteTechnicianOption[],
): RouteTechnician[] {
  return technicians.map((technician) => ({
    id: technician.id,
    name: technician.name,
  }));
}

function normalizeOrders(
  orders: AvailableRouteWorkOrder[],
): BuilderWorkOrder[] {
  return orders.map((order) => ({
    id: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    title: order.title,
    serviceKind: order.serviceKind,
    frequencyLabel: order.frequencyLabel,
    weekdays: order.weekdays,
    scheduledTime: order.scheduledTime,
    scheduledDate: order.scheduledDate,
    weekdaysLabel: order.weekdaysLabel,
    address: order.address,
    status: order.status,
    lat: order.lat,
    lng: order.lng,
    totalAmount: order.totalAmount,
    technicianId: order.technicianId,
    technicianName: order.technicianName,
  }));
}

function weekdayFromDate(dateIso?: string | null): RouteWeekday | null {
  if (!dateIso) return null;

  const date = new Date(`${String(dateIso).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  const map: Record<number, RouteWeekday> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
  };

  return map[date.getDay()] || null;
}

function weekStartFromDate(dateIso?: string | null) {
  if (!dateIso) return null;

  const date = new Date(`${String(dateIso).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return toIsoDate(startOfWeekMonday(date));
}

function defaultWeekdaysForOrder(order: BuilderWorkOrder): RouteWeekday[] {
  if (order.weekdays.length > 0) {
    return order.weekdays;
  }

  const dayFromDate = weekdayFromDate(order.scheduledDate);

  if (dayFromDate) {
    return [dayFromDate];
  }

  return ["MONDAY"];
}

function sameWeek(a: string, b: string) {
  return a === b;
}

export default function RouteBuilder({
  technicians,
  initialAvailableOrders,
}: {
  technicians: RouteTechnicianOption[];
  initialAvailableOrders: AvailableRouteWorkOrder[];
}) {
  const router = useRouter();

  const [pending, startTransition] = React.useTransition();

  const routeTechnicians = React.useMemo(
    () => normalizeTechnicians(technicians),
    [technicians],
  );

  const workOrders = React.useMemo(
    () => normalizeOrders(initialAvailableOrders),
    [initialAvailableOrders],
  );

  const [technicianId, setTechnicianId] = React.useState("");
  const [weekStartDate, setWeekStartDate] = React.useState(() =>
    toIsoDate(startOfWeekMonday(new Date())),
  );
  const [search, setSearch] = React.useState("");
  const [plannedOrders, setPlannedOrders] = React.useState<
    BuilderPlannedRouteOrder[]
  >([]);

  const weekLabel = React.useMemo(
    () => formatWeekLabel(weekStartDate),
    [weekStartDate],
  );

  const selectedTechnician = React.useMemo(
    () => routeTechnicians.find((item) => item.id === technicianId) || null,
    [routeTechnicians, technicianId],
  );

  const plannedServiceOrderIds = React.useMemo(
    () => new Set(plannedOrders.map((item) => item.id)),
    [plannedOrders],
  );

  const availableOrders = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return workOrders.filter((order) => {
      if (plannedServiceOrderIds.has(order.id)) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        order.customerName,
        order.title,
        order.frequencyLabel,
        order.weekdaysLabel,
        order.scheduledTime,
        order.scheduledDate,
        formatDate(order.scheduledDate),
        order.address,
        order.technicianName,
        weekdaysLabel(order.weekdays),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [workOrders, plannedServiceOrderIds, search]);

  const poolCount = React.useMemo(
    () => new Set(plannedOrders.map((item) => item.customerId)).size,
    [plannedOrders],
  );

  function addOrder(order: BuilderWorkOrder) {
    const orderTechnicianId = order.technicianId || "";
    const finalTechnicianId = technicianId || orderTechnicianId;

    if (!finalTechnicianId) {
      toast.error("Selecione o técnico responsável antes de adicionar OS.");
      return;
    }

    const orderWeekStart = weekStartFromDate(order.scheduledDate);

    if (orderWeekStart && plannedOrders.length === 0) {
      setWeekStartDate(orderWeekStart);
    }

    if (
      orderWeekStart &&
      plannedOrders.length > 0 &&
      !sameWeek(orderWeekStart, weekStartDate)
    ) {
      toast.error(
        `Essa OS está agendada para ${formatDate(
          order.scheduledDate,
        )}, fora da semana selecionada. Troque a semana antes de adicionar.`,
      );
      return;
    }

    if (!technicianId && orderTechnicianId) {
      setTechnicianId(orderTechnicianId);
    }

    setPlannedOrders((current) => [
      ...current,
      {
        ...order,
        plannedId: generateId(),
        technicianId: finalTechnicianId,
        weekdays: defaultWeekdaysForOrder(order),
        order: current.length + 1,
      },
    ]);

    toast.success("OS adicionada ao planejamento semanal.");
  }

  function removeOrder(plannedId: string) {
    setPlannedOrders((current) =>
      current
        .filter((item) => item.plannedId !== plannedId)
        .map((item, index) => ({
          ...item,
          order: index + 1,
        })),
    );
  }

  function updateOrder(
    plannedId: string,
    patch: Partial<
      Pick<BuilderPlannedRouteOrder, "scheduledTime" | "weekdays">
    >,
  ) {
    setPlannedOrders((current) =>
      current.map((item) =>
        item.plannedId === plannedId ? { ...item, ...patch } : item,
      ),
    );
  }

  function moveOrderWithinWeek(plannedId: string, direction: "up" | "down") {
    setPlannedOrders((current) => {
      const index = current.findIndex((item) => item.plannedId === plannedId);

      if (index === -1) return current;

      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const copy = [...current];

      const currentItem = copy[index];
      const nextItem = copy[nextIndex];

      copy[index] = nextItem;
      copy[nextIndex] = currentItem;

      return copy.map((item, itemIndex) => ({
        ...item,
        order: itemIndex + 1,
      }));
    });
  }

  function handlePreviousWeek() {
    setWeekStartDate((current) => {
      const date = new Date(`${current}T00:00:00`);

      date.setDate(date.getDate() - 7);

      return toIsoDate(date);
    });
  }

  function handleCurrentWeek() {
    setWeekStartDate(toIsoDate(startOfWeekMonday(new Date())));
  }

  function handleNextWeek() {
    setWeekStartDate((current) => {
      const date = new Date(`${current}T00:00:00`);

      date.setDate(date.getDate() + 7);

      return toIsoDate(date);
    });
  }

  function handleSaveRoute() {
    if (!selectedTechnician) {
      toast.error("Selecione o técnico responsável.");
      return;
    }

    if (plannedOrders.length === 0) {
      toast.error("Adicione pelo menos uma OS ao planejamento.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await createWeeklyRoutesFromPlanner({
          employeeUserId: selectedTechnician.id,
          weekStartDate,
          items: plannedOrders.map((order) => ({
            serviceOrderId: order.id,
            customerName: order.customerName,
            weekdays: order.weekdays,
            scheduledTime: order.scheduledTime,
            order: order.order,
          })),
        });

        if (!response.ok) {
          toast.error(
            response.error ||
              "Não foi possível criar a rota. Verifique o status das OS selecionadas.",
          );
          return;
        }

        if (response.count <= 0) {
          toast.error("Nenhuma rota foi criada. Verifique as OS selecionadas.");
          return;
        }

        toast.success(
          response.count === 1
            ? "Rota criada com sucesso."
            : `${response.count} rotas criadas com sucesso.`,
        );

        setPlannedOrders([]);

        router.push("/routes/dashboard");
        router.refresh();
      } catch (error: any) {
        toast.error(
          error?.message ||
            "Não foi possível criar a rota. Verifique o status das OS selecionadas.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <RouteFiltersBar
        technicians={routeTechnicians}
        technicianId={technicianId}
        onTechnicianChange={setTechnicianId}
        weekLabel={weekLabel}
        onPreviousWeek={handlePreviousWeek}
        onCurrentWeek={handleCurrentWeek}
        onNextWeek={handleNextWeek}
        search={search}
        onSearchChange={setSearch}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              OS aprovadas disponíveis
            </h2>

            <p className="text-xs text-slate-500">
              Selecione somente OS com status Aguardando execução.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {availableOrders.length} disponível
            {availableOrders.length === 1 ? "" : "is"}
          </span>
        </div>

        <AvailableWorkOrdersCard
          orders={availableOrders}
          onAddOrder={addOrder}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Planejamento semanal
            </h2>

            <p className="text-xs text-slate-500">
              Dias na vertical e horários na horizontal. Cada card aparece na
              janela do horário previsto.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-slate-500">Técnico</div>

              <div className="mt-1 max-w-[120px] truncate font-semibold text-slate-800">
                {selectedTechnician?.name || "Não selecionado"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-slate-500">OS</div>

              <div className="mt-1 font-semibold text-slate-800">
                {plannedOrders.length}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-slate-500">Piscinas</div>

              <div className="mt-1 font-semibold text-slate-800">
                {poolCount}
              </div>
            </div>
          </div>
        </div>

        <WeeklyTechnicianBoard
          orders={plannedOrders}
          onRemoveOrder={removeOrder}
          onUpdateOrder={updateOrder}
          onMoveOrder={moveOrderWithinWeek}
        />

        {plannedOrders.length === 0 && (
          <div className="rounded-b-xl border-x border-b border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            Nenhuma OS adicionada ainda. Adicione uma OS aprovada para visualizar
            o planejamento por dia e horário.
          </div>
        )}
      </section>

      <FullWidthRouteMap orders={plannedOrders} weekLabel={weekLabel} />

      <div className="flex justify-end">
        <Button
          type="button"
          className="h-10 min-w-[160px] btn-brand text-white"
          onClick={handleSaveRoute}
          disabled={pending}
        >
          {pending ? "Criando..." : "Criar rota"}
        </Button>
      </div>
    </div>
  );
}