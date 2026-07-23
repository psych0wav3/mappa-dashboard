"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  GripVertical,
  ListOrdered,
  MapPin,
  Plus,
  Route,
  Save,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  createRouteFromPlanner,
  type AvailableRouteWorkOrder,
  type RouteTechnicianOption,
} from "@/app/(private)/routes/actions";

type RouteBuilderProps = {
  technicians: RouteTechnicianOption[];
  initialOrders: AvailableRouteWorkOrder[];
};

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - offset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Data não informada";
  }

  const [year, month, day] = value
    .slice(0, 10)
    .split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatMoney(value?: number | null) {
  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}

function weekdayName(dateValue: string) {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

function defaultRouteTitle(
  routeDate: string,
  technicianName?: string,
) {
  const weekday = weekdayName(routeDate);

  const capitalizedWeekday = weekday
    ? weekday.charAt(0).toUpperCase() +
      weekday.slice(1)
    : "Dia";

  if (technicianName) {
    return `Rota de ${capitalizedWeekday} — ${technicianName}`;
  }

  return `Rota de ${capitalizedWeekday}`;
}

function AvailableOrderCard({
  order,
  onAdd,
}: {
  order: AvailableRouteWorkOrder;
  onAdd: () => void;
}) {
  const canAdd = order.hasAddress;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {order.customerName}
            </h3>

            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              Pronta para rota
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {order.title}
          </p>

          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

              <span>
                {formatDate(order.scheduledDate)}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CircleDollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

              <span>
                {order.totalAmount > 0
                  ? formatMoney(order.totalAmount)
                  : "Inclusa no plano"}
              </span>
            </div>

            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  order.hasAddress
                    ? "text-sky-600"
                    : "text-amber-600"
                }`}
              />

              <span
                className={
                  order.hasAddress
                    ? ""
                    : "font-medium text-amber-700"
                }
              >
                {order.hasAddress
                  ? order.address
                  : "Endereço pendente"}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          className="btn-brand h-10 shrink-0 rounded-xl px-4 text-white"
          onClick={onAdd}
          disabled={!canAdd}
          title={
            canAdd
              ? "Adicionar ordem à rota"
              : "A OS precisa de um endereço antes de ser roteirizada"
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Adicionar
        </Button>
      </div>

      {!order.hasAddress && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          Cadastre ou vincule o endereço do cliente
          antes de adicionar esta OS à rota.
        </div>
      )}
    </article>
  );
}

function SelectedStopCard({
  order,
  position,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  order: AvailableRouteWorkOrder;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <GripVertical className="h-5 w-5 text-slate-300" />

          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-sm font-bold text-white">
            {position}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {order.customerName}
          </h3>

          <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
            {order.title}
          </p>

          <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

            <span>{order.address}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Mover para cima"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={onMoveDown}
            disabled={isLast}
            title="Mover para baixo"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onRemove}
            title="Remover da rota"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function RouteBuilder({
  technicians,
  initialOrders,
}: RouteBuilderProps) {
  const router = useRouter();

  const [pending, startTransition] =
    React.useTransition();

  const [routeDate, setRouteDate] =
    React.useState(todayIso());

  const [employeeUserId, setEmployeeUserId] =
    React.useState("");

  const [title, setTitle] =
    React.useState(
      defaultRouteTitle(todayIso()),
    );

  const [search, setSearch] =
    React.useState("");

  const [onlySelectedDate, setOnlySelectedDate] =
    React.useState(false);

  const [selectedIds, setSelectedIds] =
    React.useState<string[]>([]);

  const selectedTechnician =
    React.useMemo(
      () =>
        technicians.find(
          (technician) =>
            technician.id === employeeUserId,
        ) || null,
      [employeeUserId, technicians],
    );

  const orderMap = React.useMemo(
    () =>
      new Map(
        initialOrders.map((order) => [
          order.id,
          order,
        ]),
      ),
    [initialOrders],
  );

  const selectedOrders =
    React.useMemo(
      () =>
        selectedIds
          .map((id) => orderMap.get(id))
          .filter(
            (
              order,
            ): order is AvailableRouteWorkOrder =>
              Boolean(order),
          ),
      [orderMap, selectedIds],
    );

  const filteredOrders =
    React.useMemo(() => {
      const normalizedSearch = search
        .trim()
        .toLocaleLowerCase("pt-BR");

      return initialOrders.filter((order) => {
        if (selectedIds.includes(order.id)) {
          return false;
        }

        if (
          onlySelectedDate &&
          order.scheduledDate !== routeDate
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const content = [
          order.customerName,
          order.title,
          order.description,
          order.address,
          order.scheduledDate,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pt-BR");

        return content.includes(normalizedSearch);
      });
    }, [
      initialOrders,
      onlySelectedDate,
      routeDate,
      search,
      selectedIds,
    ]);

  const selectedWithCoordinates =
    selectedOrders.filter(
      (order) => order.hasCoordinates,
    );

  const isValid =
    Boolean(title.trim()) &&
    Boolean(routeDate) &&
    Boolean(employeeUserId) &&
    selectedOrders.length > 0 &&
    selectedOrders.every(
      (order) => order.hasAddress,
    );

  React.useEffect(() => {
    setTitle(
      defaultRouteTitle(
        routeDate,
        selectedTechnician?.name,
      ),
    );
  }, [routeDate, selectedTechnician?.name]);

  function addOrder(orderId: string) {
    setSelectedIds((current) =>
      current.includes(orderId)
        ? current
        : [...current, orderId],
    );
  }

  function removeOrder(orderId: string) {
    setSelectedIds((current) =>
      current.filter((id) => id !== orderId),
    );
  }

  function moveOrder(
    index: number,
    direction: -1 | 1,
  ) {
    setSelectedIds((current) => {
      const targetIndex = index + direction;

      if (
        targetIndex < 0 ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];

      [next[index], next[targetIndex]] = [
        next[targetIndex],
        next[index],
      ];

      return next;
    });
  }

  function handleSubmit() {
    if (!employeeUserId) {
      toast.error(
        "Selecione o técnico responsável.",
      );

      return;
    }

    if (!title.trim()) {
      toast.error(
        "Informe o nome da rota.",
      );

      return;
    }

    if (!selectedOrders.length) {
      toast.error(
        "Adicione ao menos uma ordem à rota.",
      );

      return;
    }

    if (
      selectedOrders.some(
        (order) => !order.hasAddress,
      )
    ) {
      toast.error(
        "Todas as ordens precisam possuir endereço.",
      );

      return;
    }

    startTransition(async () => {
      const result =
        await createRouteFromPlanner({
          title: title.trim(),
          routeDate,
          employeeUserId,
          serviceOrderIds: selectedIds,
        });

      if (!result.ok) {
        toast.error(
          result.error ||
            "Não foi possível criar a rota.",
        );

        return;
      }

      toast.success(
        `Rota criada com ${selectedIds.length} ${
          selectedIds.length === 1
            ? "atendimento"
            : "atendimentos"
        }.`,
      );

      router.push("/routes/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-28">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <Route className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Criar rota
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Escolha o dia, defina o técnico e
                organize a sequência dos atendimentos.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              router.push("/routes/dashboard")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />

            Voltar às rotas
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <ClipboardList className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Dados da rota
            </h2>

            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Cada rota pertence a um único dia e a um
              técnico responsável.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Data da rota
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <Input
              type="date"
              value={routeDate}
              onChange={(event) =>
                setRouteDate(event.target.value)
              }
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Técnico responsável
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              value={employeeUserId}
              onChange={(event) =>
                setEmployeeUserId(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                Selecione um técnico...
              </option>

              {technicians.map((technician) => (
                <option
                  key={technician.id}
                  value={technician.id}
                >
                  {technician.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Nome da rota
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <Input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Ex.: Rota de segunda-feira"
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Ordens disponíveis
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Selecione as OS que serão executadas
                  nesta rota.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar cliente, serviço ou endereço..."
                  className="h-10 rounded-xl pl-10"
                />
              </div>

              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={onlySelectedDate}
                  onChange={(event) =>
                    setOnlySelectedDate(
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                Somente {formatDate(routeDate)}
              </label>
            </div>
          </div>

          <div className="mt-4 max-h-[720px] space-y-3 overflow-y-auto pr-1">
            {filteredOrders.map((order) => (
              <AvailableOrderCard
                key={order.id}
                order={order}
                onAdd={() => addOrder(order.id)}
              />
            ))}

            {filteredOrders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-slate-300" />

                <h3 className="mt-3 text-sm font-semibold text-slate-700">
                  Nenhuma OS disponível
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  Não existem ordens compatíveis com
                  os filtros ou todas já foram
                  adicionadas.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <ListOrdered className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Sequência da rota
                  </h2>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    A ordem abaixo será enviada como
                    sequência de execução.
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {selectedOrders.length}{" "}
                {selectedOrders.length === 1
                  ? "parada"
                  : "paradas"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {selectedOrders.map(
                (order, index) => (
                  <SelectedStopCard
                    key={order.id}
                    order={order}
                    position={index + 1}
                    isFirst={index === 0}
                    isLast={
                      index ===
                      selectedOrders.length - 1
                    }
                    onMoveUp={() =>
                      moveOrder(index, -1)
                    }
                    onMoveDown={() =>
                      moveOrder(index, 1)
                    }
                    onRemove={() =>
                      removeOrder(order.id)
                    }
                  />
                ),
              )}

              {selectedOrders.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <ListOrdered className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Nenhuma parada adicionada
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Use o botão “Adicionar” para
                    montar a sequência da rota.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <MapPin className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Visão geográfica
                  </h2>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {
                      selectedWithCoordinates.length
                    }{" "}
                    de {selectedOrders.length} paradas
                    possuem coordenadas para o mapa.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden bg-slate-100">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(186,230,253,0.65)_0%,rgba(224,242,254,0.8)_45%,rgba(220,252,231,0.75)_45%,rgba(240,253,244,0.9)_100%)]" />

              <div className="absolute inset-x-[12%] top-[28%] h-px rotate-6 bg-slate-300" />
              <div className="absolute inset-x-[8%] bottom-[28%] h-px -rotate-6 bg-slate-300" />
              <div className="absolute bottom-[8%] left-[36%] top-[5%] w-px rotate-6 bg-slate-300" />

              {selectedWithCoordinates.length >
              0 ? (
                <div className="relative z-10 grid min-h-[280px] place-items-center p-6">
                  <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Paradas com localização
                    </h3>

                    <div className="mt-3 space-y-2">
                      {selectedWithCoordinates.map(
                        (order, index) => (
                          <div
                            key={order.id}
                            className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2"
                          >
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-600 text-xs font-bold text-white">
                              {index + 1}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold text-slate-700">
                                {order.customerName}
                              </div>

                              <div className="truncate text-[11px] text-slate-400">
                                {order.address}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 grid min-h-[280px] place-items-center p-6">
                  <div className="max-w-sm rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-center shadow-lg backdrop-blur">
                    <MapPin className="mx-auto h-7 w-7 text-sky-600" />

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Mapa aguardando localizações
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Adicione ordens com latitude e
                      longitude para visualizar os
                      pontos geográficos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:left-[var(--sidebar-w)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-sky-600" />

              <span>
                Técnico:{" "}
                <strong className="text-slate-700">
                  {selectedTechnician?.name ||
                    "não selecionado"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-sky-600" />

              <span>
                Data:{" "}
                <strong className="text-slate-700">
                  {formatDate(routeDate)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-sky-600" />

              <span>
                <strong className="text-slate-700">
                  {selectedOrders.length}
                </strong>{" "}
                atendimentos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                router.push("/routes/dashboard")
              }
              disabled={pending}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="btn-brand rounded-xl px-6 text-white"
              onClick={handleSubmit}
              disabled={pending || !isValid}
              title={
                isValid
                  ? "Criar rota"
                  : "Selecione técnico, data e ao menos uma OS com endereço"
              }
            >
              <Save className="mr-2 h-4 w-4" />

              {pending
                ? "Criando rota..."
                : "Criar rota"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}