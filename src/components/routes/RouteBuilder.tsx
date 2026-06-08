"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ClipboardList,
  MapPin,
  Route,
  Search,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AvailableWorkOrdersCard from "@/components/routes/AvailableWorkOrdersCard";
import SelectedRouteOrdersCard from "@/components/routes/SelectedRouteOrdersCard";

import {
  type AvailableWorkOrder,
  type RouteTechnician,
  type SelectedRouteOrder,
  weekdaysLabel,
} from "@/components/routes/routeBuilderMockTypes";

const MOCK_TECHNICIANS: RouteTechnician[] = [
  {
    id: "tech-1",
    name: "Ellen Richter",
  },
  {
    id: "tech-2",
    name: "Lucas Técnico",
  },
  {
    id: "tech-3",
    name: "Magno Piscinas",
  },
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
];

function MockRouteMap({ orders }: { orders: SelectedRouteOrder[] }) {
  return (
    <div className="relative h-[520px] overflow-hidden bg-[linear-gradient(135deg,#dff8e8_0%,#dff8e8_35%,#d8eefc_35%,#d8eefc_50%,#f4f9ff_50%,#f4f9ff_100%)]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[8%] top-[20%] h-[2px] w-[85%] rotate-12 bg-slate-400" />
        <div className="absolute left-[20%] top-[70%] h-[2px] w-[70%] -rotate-12 bg-slate-400" />
        <div className="absolute left-[45%] top-0 h-full w-[2px] rotate-12 bg-slate-400" />
      </div>

      {orders.map((order, index) => {
        const positions = [
          { left: "50%", top: "45%" },
          { left: "58%", top: "35%" },
          { left: "45%", top: "58%" },
          { left: "66%", top: "54%" },
          { left: "39%", top: "38%" },
          { left: "55%", top: "68%" },
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-sm font-bold text-white shadow-lg">
              {index + 1}
            </div>
          </div>
        );
      })}

      {orders.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            Adicione OS à rota para visualizar os pins no mapa.
          </div>
        </div>
      )}
    </div>
  );
}

export default function RouteBuilder() {
  const [technicianId, setTechnicianId] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedOrders, setSelectedOrders] = React.useState<
    SelectedRouteOrder[]
  >([]);

  const selectedIds = React.useMemo(
    () => new Set(selectedOrders.map((item) => item.id)),
    [selectedOrders],
  );

  const selectedTechnician = React.useMemo(
    () => MOCK_TECHNICIANS.find((item) => item.id === technicianId) || null,
    [technicianId],
  );

  const availableOrders = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return MOCK_WORK_ORDERS.filter((order) => {
      if (selectedIds.has(order.id)) return false;

      if (!term) return true;

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
  }, [search, selectedIds]);

  const poolCount = React.useMemo(
    () => new Set(selectedOrders.map((item) => item.customerId)).size,
    [selectedOrders],
  );

  function addOrder(order: AvailableWorkOrder) {
    setSelectedOrders((current) => [
      ...current,
      {
        ...order,
        order: current.length + 1,
      },
    ]);

    toast.success("OS adicionada à rota.");
  }

  function removeOrder(id: string) {
    setSelectedOrders((current) =>
      current
        .filter((item) => item.id !== id)
        .map((item, index) => ({
          ...item,
          order: index + 1,
        })),
    );
  }

  function updateSelectedOrder(
    id: string,
    patch: Partial<Pick<SelectedRouteOrder, "scheduledTime" | "weekdays">>,
  ) {
    setSelectedOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function moveOrder(id: string, direction: "up" | "down") {
    setSelectedOrders((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;

      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const copy = [...current];
      const currentItem = copy[index];
      const nextItem = copy[nextIndex];

      copy[index] = nextItem;
      copy[nextIndex] = currentItem;

      return copy.map((row, rowIndex) => ({
        ...row,
        order: rowIndex + 1,
      }));
    });
  }

  function handleSaveRoute() {
    if (!selectedTechnician) {
      toast.error("Selecione o técnico responsável.");
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error("Adicione pelo menos uma OS à rota.");
      return;
    }

    toast.success("Tela pronta. Integração com API pendente.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-sky-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Técnico responsável
              </h2>
              <p className="text-xs text-slate-500">
                Selecione quem executará esta rota.
              </p>
            </div>
          </div>

          <select
            value={technicianId}
            onChange={(event) => setTechnicianId(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
          >
            <option value="">Selecione um técnico...</option>

            {MOCK_TECHNICIANS.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Route className="h-4 w-4 text-sky-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Resumo da rota
              </h2>
              <p className="text-xs text-slate-500">
                A rota será criada com as OS selecionadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">OS</div>
              <div className="mt-1 text-lg font-semibold text-slate-800">
                {selectedOrders.length}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Piscinas</div>
              <div className="mt-1 text-lg font-semibold text-slate-800">
                {poolCount}
              </div>
            </div>
          </div>
        </section>

        <SelectedRouteOrdersCard
          orders={selectedOrders}
          onRemove={removeOrder}
          onMove={moveOrder}
          onChangeOrder={updateSelectedOrder}
        />

        <Button
          type="button"
          className="h-11 w-full btn-brand text-white"
          onClick={handleSaveRoute}
        >
          Criar rota
        </Button>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-sky-600" />
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  OS aprovadas disponíveis
                </h2>
                <p className="text-xs text-slate-500">
                  Selecione as OS que entrarão nesta rota.
                </p>
              </div>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {availableOrders.length} disponíveis
            </span>
          </div>

          <div className="relative mb-3">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente, endereço, serviço ou dia..."
              className="pl-9"
            />
          </div>

          <AvailableWorkOrdersCard
            orders={availableOrders}
            onAddOrder={addOrder}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-600" />
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Mapa</h2>
                <p className="text-xs text-slate-500">
                  Os pins aparecem conforme as OS são adicionadas.
                </p>
              </div>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {selectedOrders.length} pins
            </span>
          </div>

          <MockRouteMap orders={selectedOrders} />
        </section>
      </div>
    </div>
  );
}