"use client";

import * as React from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  CirclePause,
  CirclePlay,
  ClipboardCheck,
  Clock3,
  Info,
  ListRestart,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  WorkOrderChecklistTemplateOption,
  WorkOrderCustomerOption,
  WorkOrderMeasurementTemplateOption,
  WorkOrderTechnicianOption,
} from "../workorders/actions";

import {
  createServicePlan,
  generateServicePlanOrders,
  updateServicePlanStatus,
  type RecurrenceFrequencyType,
  type ServicePlan,
} from "./actions";

const DEFAULT_GENERATE_DAYS_AHEAD = 30;

const WEEKDAYS = [
  {
    value: 1,
    shortLabel: "Seg",
    label: "Segunda-feira",
  },
  {
    value: 2,
    shortLabel: "Ter",
    label: "Terça-feira",
  },
  {
    value: 3,
    shortLabel: "Qua",
    label: "Quarta-feira",
  },
  {
    value: 4,
    shortLabel: "Qui",
    label: "Quinta-feira",
  },
  {
    value: 5,
    shortLabel: "Sex",
    label: "Sexta-feira",
  },
  {
    value: 6,
    shortLabel: "Sáb",
    label: "Sábado",
  },
  {
    value: 0,
    shortLabel: "Dom",
    label: "Domingo",
  },
];

function todayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - timezoneOffset * 60_000,
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

function statusLabel(
  status: ServicePlan["status"],
) {
  const labels: Record<
    ServicePlan["status"],
    string
  > = {
    ACTIVE: "Ativo",
    PAUSED: "Pausado",
    CANCELED: "Cancelado",
    FINISHED: "Encerrado",
  };

  return labels[status];
}

function statusClassName(
  status: ServicePlan["status"],
) {
  if (status === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "PAUSED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "FINISHED") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function recurrenceLabel(plan: ServicePlan) {
  const recurrence = plan.recurrence;

  if (
    recurrence.frequencyType === "DAILY"
  ) {
    return recurrence.intervalValue === 1
      ? "Todos os dias"
      : `A cada ${recurrence.intervalValue} dias`;
  }

  if (
    recurrence.frequencyType === "MONTHLY"
  ) {
    const day =
      recurrence.dayOfMonth || "—";

    return recurrence.intervalValue === 1
      ? `Todo mês, no dia ${day}`
      : `A cada ${recurrence.intervalValue} meses, no dia ${day}`;
  }

  const days = WEEKDAYS.filter((day) =>
    recurrence.daysOfWeek.includes(
      day.value,
    ),
  )
    .map((day) => day.shortLabel)
    .join(", ");

  if (!days) {
    return recurrence.intervalValue === 1
      ? "Semanal — dias não informados"
      : `A cada ${recurrence.intervalValue} semanas — dias não informados`;
  }

  return recurrence.intervalValue === 1
    ? `Toda semana: ${days}`
    : `A cada ${recurrence.intervalValue} semanas: ${days}`;
}

function planStartLabel(plan: ServicePlan) {
  if (!plan.startDate) {
    return "Início não informado";
  }

  return `Ativo desde ${formatDate(
    plan.startDate,
  )}`;
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  pending,
  onStatusChange,
  onGenerate,
}: {
  plan: ServicePlan;
  pending: boolean;
  onStatusChange: (
    plan: ServicePlan,
    status: "ACTIVE" | "PAUSED",
  ) => void;
  onGenerate: (plan: ServicePlan) => void;
}) {
  const isActive =
    plan.status === "ACTIVE";

  const isPaused =
    plan.status === "PAUSED";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {plan.title}
            </h3>

            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                plan.status,
              )}`}
            >
              {statusLabel(plan.status)}
            </span>
          </div>

          {plan.description && (
            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
              {plan.description}
            </p>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Cliente
                </div>

                <div className="mt-1 truncate text-sm font-medium text-slate-700">
                  {plan.customerName ||
                    "Cliente não informado"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3">
              <ListRestart className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Recorrência
                </div>

                <div className="mt-1 text-sm font-medium leading-5 text-slate-700">
                  {recurrenceLabel(plan)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Início do plano
                </div>

                <div className="mt-1 text-sm font-medium leading-5 text-slate-700">
                  {planStartLabel(plan)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-auto lg:min-w-[220px]">
          {isActive && (
            <Button
              type="button"
              className="btn-brand h-10 w-full rounded-xl text-white"
              onClick={() =>
                onGenerate(plan)
              }
              disabled={pending}
              title="Criar as próximas ordens previstas que ainda não existem"
            >
              <RefreshCw className="mr-2 h-4 w-4" />

              Sincronizar próximas OS
            </Button>
          )}

          {isActive && (
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl"
              onClick={() =>
                onStatusChange(
                  plan,
                  "PAUSED",
                )
              }
              disabled={pending}
            >
              <CirclePause className="mr-2 h-4 w-4" />

              Pausar plano
            </Button>
          )}

          {isPaused && (
            <Button
              type="button"
              className="btn-brand h-10 w-full rounded-xl text-white"
              onClick={() =>
                onStatusChange(
                  plan,
                  "ACTIVE",
                )
              }
              disabled={pending}
            >
              <CirclePlay className="mr-2 h-4 w-4" />

              Reativar plano
            </Button>
          )}

          {!isActive && !isPaused && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs leading-5 text-slate-500">
              Este plano não permite novas ações.
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <div className="flex items-start gap-2 border-t border-emerald-100 bg-emerald-50/60 px-5 py-3 text-xs leading-5 text-emerald-800">
          <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0" />

          Este plano continuará ativo e recorrente até ser pausado ou encerrado.
        </div>
      )}

      {isPaused && (
        <div className="flex items-start gap-2 border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-800">
          <CirclePause className="mt-0.5 h-4 w-4 shrink-0" />

          O plano está pausado. Nenhuma nova OS será gerada até que ele seja reativado.
        </div>
      )}
    </article>
  );
}

export default function ServicePlansClient({
  initialPlans,
  customers,
  technicians,
  checklistTemplates,
  measurementTemplates,
}: {
  initialPlans: ServicePlan[];
  customers: WorkOrderCustomerOption[];
  technicians: WorkOrderTechnicianOption[];
  checklistTemplates: WorkOrderChecklistTemplateOption[];
  measurementTemplates: WorkOrderMeasurementTemplateOption[];
}) {
  const [pending, startTransition] =
    React.useTransition();

  const [plans, setPlans] =
    React.useState(initialPlans);

  const [showForm, setShowForm] =
    React.useState(false);

  const [customerId, setCustomerId] =
    React.useState("");

  const [title, setTitle] =
    React.useState("");

  const [description, setDescription] =
    React.useState("");

  const [startDate, setStartDate] =
    React.useState(todayIso());

  const [
    frequencyType,
    setFrequencyType,
  ] =
    React.useState<RecurrenceFrequencyType>(
      "WEEKLY",
    );

  const [
    intervalValue,
    setIntervalValue,
  ] = React.useState(1);

  const [daysOfWeek, setDaysOfWeek] =
    React.useState<number[]>([1]);

  const [
    dayOfMonth,
    setDayOfMonth,
  ] = React.useState(1);

  const [
    preferredEmployeeUserId,
    setPreferredEmployeeUserId,
  ] = React.useState("");

  const [
    checklistTemplateId,
    setChecklistTemplateId,
  ] = React.useState("");

  const [
    measurementTemplateId,
    setMeasurementTemplateId,
  ] = React.useState("");

  const selectedCustomer =
    React.useMemo(
      () =>
        customers.find(
          (customer) =>
            customer.id === customerId,
        ) || null,
      [customers, customerId],
    );

  const selectedDaysLabel =
    React.useMemo(
      () =>
        WEEKDAYS.filter((day) =>
          daysOfWeek.includes(day.value),
        )
          .map((day) => day.label)
          .join(", "),
      [daysOfWeek],
    );

  const intervalUnit =
    frequencyType === "DAILY"
      ? intervalValue === 1
        ? "dia"
        : "dias"
      : frequencyType === "MONTHLY"
        ? intervalValue === 1
          ? "mês"
          : "meses"
        : intervalValue === 1
          ? "semana"
          : "semanas";

  const recurrencePreview =
    React.useMemo(() => {
      if (frequencyType === "DAILY") {
        return intervalValue === 1
          ? "O atendimento acontecerá todos os dias."
          : `O atendimento acontecerá a cada ${intervalValue} dias.`;
      }

      if (
        frequencyType === "MONTHLY"
      ) {
        return intervalValue === 1
          ? `O atendimento acontecerá todo mês, no dia ${dayOfMonth}.`
          : `O atendimento acontecerá a cada ${intervalValue} meses, no dia ${dayOfMonth}.`;
      }

      if (!selectedDaysLabel) {
        return "Selecione ao menos um dia da semana.";
      }

      return intervalValue === 1
        ? `O atendimento acontecerá toda semana: ${selectedDaysLabel}.`
        : `O atendimento acontecerá a cada ${intervalValue} semanas: ${selectedDaysLabel}.`;
    }, [
      dayOfMonth,
      frequencyType,
      intervalValue,
      selectedDaysLabel,
    ]);

  const isFormValid =
    Boolean(
      selectedCustomer?.hasValidAddress,
    ) &&
    title.trim().length > 0 &&
    Boolean(startDate) &&
    Number.isInteger(intervalValue) &&
    intervalValue > 0 &&
    (
      frequencyType !== "WEEKLY" ||
      daysOfWeek.length > 0
    ) &&
    (
      frequencyType !== "MONTHLY" ||
      (
        Number.isInteger(dayOfMonth) &&
        dayOfMonth >= 1 &&
        dayOfMonth <= 31
      )
    );

  const activePlansCount =
    plans.filter(
      (plan) =>
        plan.status === "ACTIVE",
    ).length;

  const pausedPlansCount =
    plans.filter(
      (plan) =>
        plan.status === "PAUSED",
    ).length;

  function resetForm() {
    setCustomerId("");
    setTitle("");
    setDescription("");
    setStartDate(todayIso());
    setFrequencyType("WEEKLY");
    setIntervalValue(1);
    setDaysOfWeek([1]);
    setDayOfMonth(1);
    setPreferredEmployeeUserId("");
    setChecklistTemplateId("");
    setMeasurementTemplateId("");
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function toggleWeekday(day: number) {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter(
            (item) => item !== day,
          )
        : [...current, day],
    );
  }

  function handleFrequencyChange(
    nextFrequency: RecurrenceFrequencyType,
  ) {
    setFrequencyType(nextFrequency);
    setIntervalValue(1);

    if (
      nextFrequency === "WEEKLY" &&
      daysOfWeek.length === 0
    ) {
      setDaysOfWeek([1]);
    }

    if (
      nextFrequency === "MONTHLY"
    ) {
      const startDay = Number(
        startDate.slice(8, 10),
      );

      setDayOfMonth(
        startDay >= 1 &&
          startDay <= 31
          ? startDay
          : 1,
      );
    }
  }

  function handleCreate() {
    if (!isFormValid) {
      toast.error(
        "Revise os campos obrigatórios e a regra de recorrência.",
      );

      return;
    }

    startTransition(async () => {
      try {
        const created =
          await createServicePlan({
            customerId,

            customerAddressId:
              selectedCustomer
                ?.customerAddressId || "",

            title,

            description,

            startDate,

            endDate: undefined,

            preferredEmployeeUserId:
              preferredEmployeeUserId ||
              undefined,

            checklistTemplateId:
              checklistTemplateId ||
              undefined,

            measurementTemplateId:
              measurementTemplateId ||
              undefined,

            recurrence: {
              frequencyType,

              intervalValue,

              daysOfWeek:
                frequencyType ===
                "WEEKLY"
                  ? daysOfWeek
                  : [],

              dayOfMonth:
                frequencyType ===
                "MONTHLY"
                  ? dayOfMonth
                  : null,

              generateDaysAhead:
                DEFAULT_GENERATE_DAYS_AHEAD,
            },
          });

        setPlans((current) => [
          created,
          ...current.filter(
            (item) =>
              item.id !== created.id,
          ),
        ]);

        closeForm();

        toast.success(
          "Plano recorrente criado com sucesso.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível criar o plano.",
        );
      }
    });
  }

  function handleStatus(
    plan: ServicePlan,
    status: "ACTIVE" | "PAUSED",
  ) {
    startTransition(async () => {
      try {
        const updated =
          await updateServicePlanStatus({
            servicePlanId: plan.id,
            status,
          });

        setPlans((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );

        toast.success(
          status === "ACTIVE"
            ? "Plano reativado."
            : "Plano pausado.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o plano.",
        );
      }
    });
  }

  function handleGenerate(
    plan: ServicePlan,
  ) {
    startTransition(async () => {
      try {
        const result =
          await generateServicePlanOrders(
            plan.id,
          );

        toast.success(
          result.ordersGenerated > 0
            ? `${result.ordersGenerated} ${
                result.ordersGenerated === 1
                  ? "nova ordem foi criada"
                  : "novas ordens foram criadas"
              }.`
            : "As próximas ordens já estavam sincronizadas.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível sincronizar as próximas ordens.",
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              <CalendarClock className="h-3.5 w-3.5" />

              Atendimentos recorrentes
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Planos de Serviço
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Configure os atendimentos recorrentes que continuarão ativos até serem pausados ou encerrados.
            </p>
          </div>

          <Button
            type="button"
            className="btn-brand h-10 rounded-xl px-5 text-white"
            onClick={() => {
              if (showForm) {
                closeForm();
                return;
              }

              setShowForm(true);
            }}
          >
            {showForm ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}

            {showForm
              ? "Fechar cadastro"
              : "Novo plano"}
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total de planos
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {plans.length}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Planos ativos
          </div>

          <div className="mt-2 text-2xl font-bold text-emerald-800">
            {activePlansCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Planos pausados
          </div>

          <div className="mt-2 text-2xl font-bold text-amber-800">
            {pausedPlansCount}
          </div>
        </div>
      </section>

      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">
              Novo plano recorrente
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              O plano começará na data escolhida e continuará ativo até que você decida pausá-lo ou encerrá-lo.
            </p>
          </div>

          <div className="grid gap-4 p-4 sm:p-5">
            <FormSection
              icon={
                <UserRound className="h-4 w-4" />
              }
              title="Cliente e identificação"
              description="Defina para qual piscina o plano será criado."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Cliente/Piscina
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    value={customerId}
                    onChange={(event) =>
                      setCustomerId(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">
                      Selecione o cliente...
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={customer.id}
                          value={customer.id}
                          disabled={
                            !customer.hasValidAddress
                          }
                        >
                          {customer.name}
                          {customer.hasValidAddress
                            ? ""
                            : " — sem endereço válido"}
                        </option>
                      ),
                    )}
                  </select>

                  {selectedCustomer && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

                      <span>
                        {
                          selectedCustomer.addressLabel
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Nome do plano
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <Input
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Limpeza semanal"
                    className="h-11 rounded-xl"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Use um nome que facilite a identificação do atendimento.
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection
              icon={
                <CalendarDays className="h-4 w-4" />
              }
              title="Início do plano"
              description="Informe a data em que os atendimentos recorrentes devem começar."
            >
              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Data de início
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(
                        event.target.value,
                      )
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              icon={
                <Clock3 className="h-4 w-4" />
              }
              title="Regra de recorrência"
              description="Configure quando as visitas devem acontecer."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Frequência
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <select
                      value={frequencyType}
                      onChange={(event) =>
                        handleFrequencyChange(
                          event.target
                            .value as RecurrenceFrequencyType,
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="DAILY">
                        Diária
                      </option>

                      <option value="WEEKLY">
                        Semanal
                      </option>

                      <option value="MONTHLY">
                        Mensal
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Repetir a cada
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={intervalValue}
                      onChange={(event) =>
                        setIntervalValue(
                          Math.max(
                            1,
                            Math.floor(
                              Number(
                                event.target
                                  .value || 1,
                              ),
                            ),
                          ),
                        )
                      }
                      className="h-11 rounded-none border-0 focus-visible:ring-0"
                    />

                    <div className="flex min-w-28 items-center justify-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600">
                      {intervalUnit}
                    </div>
                  </div>
                </div>
              </div>

              {frequencyType ===
                "WEEKLY" && (
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Dias da semana
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {WEEKDAYS.map((day) => {
                      const selected =
                        daysOfWeek.includes(
                          day.value,
                        );

                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() =>
                            toggleWeekday(
                              day.value,
                            )
                          }
                          aria-pressed={
                            selected
                          }
                          className={`relative h-11 rounded-xl border text-sm font-semibold transition ${
                            selected
                              ? "border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-slate-50"
                          }`}
                        >
                          {selected && (
                            <Check className="absolute right-1.5 top-1.5 h-3 w-3" />
                          )}

                          {day.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {frequencyType ===
                "MONTHLY" && (
                <div className="mt-5 max-w-sm">
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Dia do mês
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <Input
                    type="number"
                    min={1}
                    max={31}
                    step={1}
                    value={dayOfMonth}
                    onChange={(event) =>
                      setDayOfMonth(
                        Math.min(
                          31,
                          Math.max(
                            1,
                            Math.floor(
                              Number(
                                event.target
                                  .value || 1,
                              ),
                            ),
                          ),
                        ),
                      )
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              )}

              <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <div className="text-xs font-semibold text-sky-800">
                  Resumo da recorrência
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {recurrencePreview}
                </p>
              </div>
            </FormSection>

            <FormSection
              icon={
                <Settings2 className="h-4 w-4" />
              }
              title="Configuração da execução"
              description="Defina o técnico e os registros exigidos durante as visitas."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Técnico preferencial
                  </label>

                  <select
                    value={
                      preferredEmployeeUserId
                    }
                    onChange={(event) =>
                      setPreferredEmployeeUserId(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">
                      Sem técnico preferencial
                    </option>

                    {technicians.map(
                      (technician) => (
                        <option
                          key={technician.id}
                          value={technician.id}
                        >
                          {technician.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Checklist da visita
                  </label>

                  <select
                    value={
                      checklistTemplateId
                    }
                    onChange={(event) =>
                      setChecklistTemplateId(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">
                      Usar checklist padrão ativo
                    </option>

                    {checklistTemplates.map(
                      (template) => (
                        <option
                          key={template.id}
                          value={template.id}
                        >
                          {template.name}
                          {template.itemsCount
                            ? ` — ${template.itemsCount} itens`
                            : ""}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Template de medição
                  </label>

                  <select
                    value={
                      measurementTemplateId
                    }
                    onChange={(event) =>
                      setMeasurementTemplateId(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">
                      Usar template padrão ativo
                    </option>

                    {measurementTemplates.map(
                      (template) => (
                        <option
                          key={template.id}
                          value={template.id}
                        >
                          {template.name}
                          {template.fieldsCount
                            ? ` — ${template.fieldsCount} campos`
                            : ""}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Descrição do plano
                  </label>

                  <Textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Limpeza completa, aspiração, escovação e análise da água."
                    rows={4}
                    className="min-h-[104px] resize-y rounded-xl"
                  />
                </div>
              </div>
            </FormSection>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={pending}
              className="rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="btn-brand rounded-xl px-6 text-white"
              onClick={handleCreate}
              disabled={
                pending || !isFormValid
              }
              title={
                !isFormValid
                  ? "Preencha os campos obrigatórios e configure a recorrência."
                  : "Salvar plano de serviço"
              }
            >
              <Save className="mr-2 h-4 w-4" />

              {pending
                ? "Salvando..."
                : "Salvar plano"}
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarClock className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Planos cadastrados
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Acompanhe os atendimentos contínuos e pause ou reative os planos quando necessário.
              </p>
            </div>
          </div>

          <div className="flex max-w-md items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              <strong>Sincronizar próximas OS</strong>{" "}
              é uma ação temporária enquanto a geração automática do backend está sendo finalizada.
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              pending={pending}
              onStatusChange={
                handleStatus
              }
              onGenerate={
                handleGenerate
              }
            />
          ))}

          {plans.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <CalendarClock className="mx-auto h-9 w-9 text-slate-300" />

              <div className="mt-3 text-sm font-semibold text-slate-700">
                Nenhum plano cadastrado
              </div>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                Crie o primeiro atendimento recorrente. Ele continuará ativo até ser pausado ou encerrado.
              </p>

              <Button
                type="button"
                className="btn-brand mt-5 rounded-xl px-5 text-white"
                onClick={() =>
                  setShowForm(true)
                }
              >
                <Plus className="mr-2 h-4 w-4" />

                Criar primeiro plano
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}