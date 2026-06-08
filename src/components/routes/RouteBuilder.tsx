"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import RouteFiltersBar from "@/components/routes/RouteFiltersBar";
import WeeklyTechnicianBoard from "@/components/routes/WeeklyTechnicianBoard";
import AvailableWorkOrdersCard from "@/components/routes/AvailableWorkOrdersCard";
import FullWidthRouteMap from "@/components/routes/FullWidthRouteMap";

import {
  type AvailableWorkOrder,
  type PlannedRouteOrder,
  type RouteTechnician,
  type RouteWeekday,
  generateId,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

const MOCK_TECHNICIANS: RouteTechnician[] = [
  { id: "tech-1", name: "Ellen Richter" },
  { id: "tech-2", name: "Lucas Técnico" },
  { id: "tech-3", name: "Magno Piscinas" },
  { id: "tech-4", name: "João Manutenção" },
  { id: "tech-5", name: "Adevaldo Piscineiro" },
];

const MOCK_WORK_ORDERS: AvailableWorkOrder[] = [
  {
    id: "os-1",
    customerId: "customer-1",
    customerName: "Thai Pousada",
    title: "Limpeza de piscina",
    serviceKind: "POOL_CLEANING",
    frequencyLabel: "Semanal",
    weekdays: ["THURSDAY"],
    scheduledTime: "09:00",
    address: "Rua das Amendoeiras, 55 - Itamambuca - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.40465,
    lng: -44.95022,
  },
  {
    id: "os-2",
    customerId: "customer-2",
    customerName: "Casa Praia Norte",
    title: "Limpeza de piscina",
    serviceKind: "POOL_CLEANING",
    frequencyLabel: "2x",
    weekdays: ["MONDAY", "THURSDAY"],
    scheduledTime: "10:30",
    address: "Rua Quinze, 120 - Itamambuca - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.40291,
    lng: -44.94859,
  },
  {
    id: "os-3",
    customerId: "customer-3",
    customerName: "Condomínio Jardim das Águas",
    title: "Limpeza de piscina",
    serviceKind: "POOL_CLEANING",
    frequencyLabel: "3x",
    weekdays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
    scheduledTime: "13:00",
    address: "Rua Manoel Soares da Silva, 800 - Itamambuca - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.40128,
    lng: -44.95391,
  },
  {
    id: "os-4",
    customerId: "customer-4",
    customerName: "Casa da Serra",
    title: "Troca de areia + Cloro",
    serviceKind: "ADDITIONAL_SERVICE",
    frequencyLabel: "Avulsa",
    weekdays: [],
    scheduledTime: "15:00",
    address: "Estrada do Casanga, 210 - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.40851,
    lng: -44.94685,
  },
  {
    id: "os-5",
    customerId: "customer-5",
    customerName: "Residencial Mar Azul",
    title: "Limpeza de piscina",
    serviceKind: "POOL_CLEANING",
    frequencyLabel: "Quinzenal",
    weekdays: ["SATURDAY"],
    scheduledTime: "08:30",
    address: "Rua dos Coqueiros, 44 - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.40031,
    lng: -44.94525,
  },
  {
    id: "os-6",
    customerId: "customer-6",
    customerName: "Casa Itamambuca",
    title: "Limpeza de piscina",
    serviceKind: "POOL_CLEANING",
    frequencyLabel: "Diária",
    weekdays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ],
    scheduledTime: "07:30",
    address: "Rua Um, 33 - Itamambuca - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.4061,
    lng: -44.9511,
  },
  {
    id: "os-7",
    customerId: "customer-7",
    customerName: "Pousada Maré Alta",
    title: "Limpeza de piscina",
    serviceKind: "POOL_CLEANING",
    frequencyLabel: "4x",
    weekdays: ["MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"],
    scheduledTime: "11:00",
    address: "Rua Dez, 220 - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.4073,
    lng: -44.9479,
  },
  {
    id: "os-8",
    customerId: "customer-8",
    customerName: "Casa do Bosque",
    title: "Aplicação de produto",
    serviceKind: "ADDITIONAL_SERVICE",
    frequencyLabel: "Avulsa",
    weekdays: [],
    scheduledTime: "16:00",
    address: "Rua do Bosque, 12 - Ubatuba/SP",
    status: "APPROVED",
    lat: -23.3999,
    lng: -44.9498,
  },
];

function defaultWeekdaysForOrder(order: AvailableWorkOrder): RouteWeekday[] {
  if (order.weekdays.length > 0) {
    return order.weekdays;
  }

  return ["MONDAY"];
}

export default function RouteBuilder() {
  const [technicianId, setTechnicianId] = React.useState("");
  const [weekLabel, setWeekLabel] = React.useState("Semana atual");
  const [search, setSearch] = React.useState("");
  const [plannedOrders, setPlannedOrders] = React.useState<
    PlannedRouteOrder[]
  >([]);

  const selectedTechnician = React.useMemo(
    () => MOCK_TECHNICIANS.find((item) => item.id === technicianId) || null,
    [technicianId],
  );

  const plannedServiceOrderIds = React.useMemo(
    () => new Set(plannedOrders.map((item) => item.id)),
    [plannedOrders],
  );

  const availableOrders = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return MOCK_WORK_ORDERS.filter((order) => {
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
        order.address,
        weekdaysLabel(order.weekdays),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [plannedServiceOrderIds, search]);

  const poolCount = React.useMemo(
    () => new Set(plannedOrders.map((item) => item.customerId)).size,
    [plannedOrders],
  );

  function addOrder(order: AvailableWorkOrder) {
    if (!technicianId) {
      toast.error("Selecione o técnico responsável antes de adicionar OS.");
      return;
    }

    setPlannedOrders((current) => [
      ...current,
      {
        ...order,
        plannedId: generateId(),
        technicianId,
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
    patch: Partial<Pick<PlannedRouteOrder, "scheduledTime" | "weekdays">>,
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
    setWeekLabel("Semana anterior");
  }

  function handleCurrentWeek() {
    setWeekLabel("Semana atual");
  }

  function handleNextWeek() {
    setWeekLabel("Próxima semana");
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

    toast.success("Tela pronta. Integração com API pendente.");
  }

  return (
    <div className="space-y-6">
      <RouteFiltersBar
        technicians={MOCK_TECHNICIANS}
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
              Selecione as OS que entrarão no planejamento semanal do técnico.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {availableOrders.length} disponíveis
          </span>
        </div>

        <AvailableWorkOrdersCard orders={availableOrders} onAddOrder={addOrder} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Planejamento semanal
            </h2>
            <p className="text-xs text-slate-500">
              Dias na vertical e horários na horizontal. Cada card aparece na
              janela do horário previsto.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Técnico</div>
              <div className="mt-1 truncate text-sm font-semibold text-slate-800">
                {selectedTechnician?.name ?? "Não selecionado"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">OS</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {plannedOrders.length}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Piscinas</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
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
      </section>

      <FullWidthRouteMap orders={plannedOrders} weekLabel={weekLabel} />

      <div className="flex justify-end">
        <Button
          type="button"
          className="h-11 min-w-[180px] btn-brand text-white"
          onClick={handleSaveRoute}
        >
          Criar rota
        </Button>
      </div>
    </div>
  );
}