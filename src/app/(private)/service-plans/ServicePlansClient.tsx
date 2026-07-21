"use client";

import * as React from "react";
import {
  CalendarClock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
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

const WEEKDAYS = [
  {
    value: 1,
    label: "Seg",
  },
  {
    value: 2,
    label: "Ter",
  },
  {
    value: 3,
    label: "Qua",
  },
  {
    value: 4,
    label: "Qui",
  },
  {
    value: 5,
    label: "Sex",
  },
  {
    value: 6,
    label: "Sáb",
  },
  {
    value: 0,
    label: "Dom",
  },
];

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "Sem término";
  }

  const [year, month, day] = value
    .slice(0, 10)
    .split("-");

  return year && month && day
    ? `${day}/${month}/${year}`
    : value;
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
    FINISHED: "Finalizado",
  };

  return labels[status];
}

function recurrenceLabel(
  plan: ServicePlan,
) {
  const recurrence = plan.recurrence;

  if (
    recurrence.frequencyType === "DAILY"
  ) {
    return recurrence.intervalValue === 1
      ? "Diário"
      : `A cada ${recurrence.intervalValue} dias`;
  }

  if (
    recurrence.frequencyType === "MONTHLY"
  ) {
    return recurrence.intervalValue === 1
      ? `Mensal, dia ${recurrence.dayOfMonth}`
      : `A cada ${recurrence.intervalValue} meses, dia ${recurrence.dayOfMonth}`;
  }

  const days = WEEKDAYS
    .filter((day) =>
      recurrence.daysOfWeek.includes(
        day.value,
      ),
    )
    .map((day) => day.label)
    .join(", ");

  return recurrence.intervalValue === 1
    ? `Semanal: ${days}`
    : `A cada ${recurrence.intervalValue} semanas: ${days}`;
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
    React.useState("");

  const [endDate, setEndDate] =
    React.useState("");

  const [frequencyType, setFrequencyType] =
    React.useState<RecurrenceFrequencyType>(
      "WEEKLY",
    );

  const [intervalValue, setIntervalValue] =
    React.useState(1);

  const [daysOfWeek, setDaysOfWeek] =
    React.useState<number[]>([1]);

  const [dayOfMonth, setDayOfMonth] =
    React.useState(1);

  const [
    generateDaysAhead,
    setGenerateDaysAhead,
  ] = React.useState(30);

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

  const selectedCustomer = React.useMemo(
    () =>
      customers.find(
        (customer) =>
          customer.id === customerId,
      ) || null,
    [customers, customerId],
  );

  function resetForm() {
    setCustomerId("");
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setFrequencyType("WEEKLY");
    setIntervalValue(1);
    setDaysOfWeek([1]);
    setDayOfMonth(1);
    setGenerateDaysAhead(30);
    setPreferredEmployeeUserId("");
    setChecklistTemplateId("");
    setMeasurementTemplateId("");
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

  function handleCreate() {
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
            endDate,
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
              daysOfWeek,
              dayOfMonth:
                frequencyType === "MONTHLY"
                  ? dayOfMonth
                  : null,
              generateDaysAhead,
            },
          });

        setPlans((current) => [
          created,
          ...current,
        ]);

        resetForm();
        setShowForm(false);

        toast.success(
          "Plano criado. As primeiras ordens foram geradas automaticamente.",
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
            ? "Plano ativado."
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
            ? `${result.ordersGenerated} nova(s) ordem(ns) gerada(s).`
            : "Nenhuma nova ordem precisava ser gerada.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível gerar as ordens.",
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Planos de Serviço
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre atendimentos recorrentes.
              O backend gera as primeiras OS
              automaticamente.
            </p>
          </div>

          <Button
            type="button"
            className="btn-brand text-white"
            onClick={() => {
              if (showForm) {
                resetForm();
              }

              setShowForm(
                (current) => !current,
              );
            }}
          >
            {showForm ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}

            {showForm
              ? "Fechar"
              : "Novo plano"}
          </Button>
        </div>
      </div>

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Novo plano recorrente
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Cliente/Piscina
              </label>

              <select
                value={customerId}
                onChange={(event) =>
                  setCustomerId(
                    event.target.value,
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">
                  Selecione...
                </option>

                {customers.map((customer) => (
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
                      : " — sem endereço"}
                  </option>
                ))}
              </select>

              {selectedCustomer && (
                <p className="mt-1 text-xs text-slate-500">
                  {
                    selectedCustomer.addressLabel
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nome do plano
              </label>

              <Input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex.: Limpeza semanal"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Início
              </label>

              <Input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Término
              </label>

              <Input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Frequência
              </label>

              <select
                value={frequencyType}
                onChange={(event) =>
                  setFrequencyType(
                    event.target
                      .value as RecurrenceFrequencyType,
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Intervalo
              </label>

              <Input
                type="number"
                min={1}
                value={intervalValue}
                onChange={(event) =>
                  setIntervalValue(
                    Math.max(
                      1,
                      Number(
                        event.target.value || 1,
                      ),
                    ),
                  )
                }
              />

              <p className="mt-1 text-xs text-slate-500">
                Ex.: intervalo 2 em semanal
                representa uma visita a cada duas
                semanas.
              </p>
            </div>

            {frequencyType === "WEEKLY" && (
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Dias da semana
                </label>

                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        toggleWeekday(day.value)
                      }
                      className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                        daysOfWeek.includes(
                          day.value,
                        )
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {frequencyType ===
              "MONTHLY" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Dia do mês
                </label>

                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(event) =>
                    setDayOfMonth(
                      Number(
                        event.target.value || 1,
                      ),
                    )
                  }
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Gerar ordens para os próximos
              </label>

              <Input
                type="number"
                min={1}
                value={generateDaysAhead}
                onChange={(event) =>
                  setGenerateDaysAhead(
                    Math.max(
                      1,
                      Number(
                        event.target.value ||
                          30,
                      ),
                    ),
                  )
                }
              />

              <p className="mt-1 text-xs text-slate-500">
                Quantidade de dias à frente.
                Padrão: 30.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Checklist
              </label>

              <select
                value={checklistTemplateId}
                onChange={(event) =>
                  setChecklistTemplateId(
                    event.target.value,
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Descrição
            </label>

            <Textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Detalhes do atendimento recorrente."
              rows={4}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              disabled={pending}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="btn-brand text-white"
              onClick={handleCreate}
              disabled={pending}
            >
              <Save className="mr-2 h-4 w-4" />

              {pending
                ? "Salvando..."
                : "Salvar plano"}
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-sky-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Planos cadastrados
            </h2>

            <p className="text-xs text-slate-500">
              Planos ativos podem gerar novos
              lotes de OS quando necessário.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left font-semibold text-slate-700">
                  Plano
                </th>

                <th className="p-3 text-left font-semibold text-slate-700">
                  Cliente
                </th>

                <th className="p-3 text-left font-semibold text-slate-700">
                  Recorrência
                </th>

                <th className="p-3 text-left font-semibold text-slate-700">
                  Período
                </th>

                <th className="p-3 text-left font-semibold text-slate-700">
                  Status
                </th>

                <th className="p-3 text-right font-semibold text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-t border-slate-200"
                >
                  <td className="p-3 font-medium text-slate-900">
                    {plan.title}
                  </td>

                  <td className="p-3 text-slate-600">
                    {plan.customerName}
                  </td>

                  <td className="p-3 text-slate-600">
                    {recurrenceLabel(plan)}
                  </td>

                  <td className="p-3 text-slate-600">
                    {formatDate(plan.startDate)}
                    {" até "}
                    {formatDate(plan.endDate)}
                  </td>

                  <td className="p-3 text-slate-600">
                    {statusLabel(plan.status)}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {plan.status ===
                      "ACTIVE" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatus(
                              plan,
                              "PAUSED",
                            )
                          }
                          disabled={pending}
                          title="Pausar plano"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : plan.status ===
                        "PAUSED" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatus(
                              plan,
                              "ACTIVE",
                            )
                          }
                          disabled={pending}
                          title="Ativar plano"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        size="sm"
                        className="btn-brand text-white"
                        onClick={() =>
                          handleGenerate(plan)
                        }
                        disabled={
                          pending ||
                          plan.status !== "ACTIVE"
                        }
                        title="Gerar novo lote de ordens"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />

                        Gerar OS
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {plans.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-sm text-slate-500"
                  >
                    Nenhum plano de serviço
                    cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}