"use client";

import * as React from "react";

import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  DollarSign,
  MapPin,
  Settings2,
  UserRound,
} from "lucide-react";

import type {
  WorkOrderChecklistTemplateOption,
  WorkOrderCustomerOption,
  WorkOrderMeasurementTemplateOption,
  WorkOrderTechnicianOption,
} from "@/app/(private)/workorders/actions";

import type {
  RecurrenceFrequencyType,
  SaveServicePlanInput,
} from "@/app/(private)/service-plans/actions";

import {
  DEFAULT_GENERATE_DAYS_AHEAD,
  WEEKDAYS,
} from "@/app/(private)/service-plans/service-plans.constants";

import {
  getRecurrencePreview,
  todayIso,
} from "@/app/(private)/service-plans/service-plans.helpers";

import FormActionBar from "@/components/ui/FormActionBar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CustomerCombobox } from "./CustomerCombobox";
import { ServicePlanFormSection } from "./ServicePlanFormSection";

type ServicePlanFormProps = {
  customers: WorkOrderCustomerOption[];
  technicians: WorkOrderTechnicianOption[];

  checklistTemplates:
    WorkOrderChecklistTemplateOption[];

  measurementTemplates:
    WorkOrderMeasurementTemplateOption[];

  pending: boolean;

  onCancel: () => void;

  onSubmit: (
    input: SaveServicePlanInput,
  ) => void;
};

export function ServicePlanForm({
  customers,
  technicians,
  checklistTemplates,
  measurementTemplates,
  pending,
  onCancel,
  onSubmit,
}: ServicePlanFormProps) {
  const [
    customerId,
    setCustomerId,
  ] = React.useState("");

  const [
    title,
    setTitle,
  ] = React.useState("");

  const [
    description,
    setDescription,
  ] = React.useState("");

  const [
    startDate,
    setStartDate,
  ] = React.useState(
    todayIso(),
  );

  const [
    totalAmount,
    setTotalAmount,
  ] = React.useState("");

  const [
    frequencyType,
    setFrequencyType,
  ] =
    React.useState<RecurrenceFrequencyType>(
      "WEEKLY",
    );

  const [
    daysOfWeek,
    setDaysOfWeek,
  ] = React.useState<number[]>([
    1,
  ]);

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
            customer.id ===
            customerId,
        ) || null,
      [
        customers,
        customerId,
      ],
    );

  const normalizedAmount =
    React.useMemo(() => {
      const sanitized =
        totalAmount
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "");

      const value =
        Number(sanitized);

      return Number.isFinite(
        value,
      )
        ? value
        : 0;
    }, [totalAmount]);

  const recurrencePreview =
    getRecurrencePreview({
      frequencyType,
      intervalValue: 1,
      dayOfMonth,
      daysOfWeek,
    });

  const isFormValid =
    Boolean(
      selectedCustomer
        ?.hasValidAddress,
    ) &&
    title.trim().length > 0 &&
    Boolean(startDate) &&
    normalizedAmount > 0 &&
    (
      frequencyType !==
        "WEEKLY" ||
      daysOfWeek.length > 0
    ) &&
    (
      frequencyType !==
        "MONTHLY" ||
      (
        Number.isInteger(
          dayOfMonth,
        ) &&
        dayOfMonth >= 1 &&
        dayOfMonth <= 31
      )
    );

  function toggleWeekday(
    day: number,
  ) {
    setDaysOfWeek(
      (current) =>
        current.includes(day)
          ? current.filter(
              (item) =>
                item !== day,
            )
          : [
              ...current,
              day,
            ].sort(
              (
                first,
                second,
              ) =>
                first -
                second,
            ),
    );
  }

  function handleFrequencyChange(
    nextFrequency:
      RecurrenceFrequencyType,
  ) {
    setFrequencyType(
      nextFrequency,
    );

    if (
      nextFrequency ===
        "WEEKLY" &&
      daysOfWeek.length === 0
    ) {
      setDaysOfWeek([
        1,
      ]);
    }

    if (
      nextFrequency ===
      "MONTHLY"
    ) {
      const startDay =
        Number(
          startDate.slice(
            8,
            10,
          ),
        );

      setDayOfMonth(
        startDay >= 1 &&
          startDay <= 31
          ? startDay
          : 1,
      );
    }
  }

  function handleSubmit() {
    if (
      !isFormValid ||
      !selectedCustomer
    ) {
      return;
    }

    onSubmit({
      customerId,

      customerAddressId:
        selectedCustomer
          .customerAddressId,

      title:
        title.trim(),

      description:
        description.trim(),

      startDate,

      endDate:
        undefined,

      totalAmount:
        normalizedAmount,

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

        intervalValue: 1,

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
  }

  return (
    <div className="space-y-5 pb-28">
      <section className="overflow-visible rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            Nova rotina de
            atendimento
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A rotina será enviada ao
            cliente para aprovação
            antes de ser ativada.
          </p>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          <ServicePlanFormSection
            icon={
              <UserRound className="h-4 w-4" />
            }
            title="Cliente e identificação"
            description="Defina para qual cliente e piscina a rotina será enviada."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Cliente/Piscina

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <CustomerCombobox
                  customers={
                    customers
                  }
                  value={
                    customerId
                  }
                  onValueChange={
                    setCustomerId
                  }
                  disabled={
                    pending
                  }
                />

                {selectedCustomer && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

                    <span>
                      {
                        selectedCustomer
                          .addressLabel
                      }
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Nome da rotina

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <Input
                  value={title}
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Ex.: Limpeza 2x por semana"
                  className="h-11 rounded-xl"
                  disabled={
                    pending
                  }
                />

                <p className="mt-2 text-xs text-slate-400">
                  Use um nome que
                  facilite a
                  identificação do
                  atendimento.
                </p>
              </div>
            </div>
          </ServicePlanFormSection>

          <ServicePlanFormSection
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            title="Início e valor"
            description="Informe quando a rotina deverá começar e o valor que será apresentado ao cliente."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Data de início

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <Input
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(
                    event,
                  ) =>
                    setStartDate(
                      event.target
                        .value,
                    )
                  }
                  min={todayIso()}
                  className="h-11 rounded-xl"
                  disabled={
                    pending
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Valor da mensalidade

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    value={
                      totalAmount
                    }
                    onChange={(
                      event,
                    ) =>
                      setTotalAmount(
                        event.target
                          .value,
                      )
                    }
                    inputMode="decimal"
                    placeholder="Ex.: 500,00"
                    className="h-11 rounded-xl pl-10"
                    disabled={
                      pending
                    }
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Este valor será
                  exibido na
                  solicitação enviada
                  ao cliente.
                </p>
              </div>
            </div>
          </ServicePlanFormSection>

          <ServicePlanFormSection
            icon={
              <Clock3 className="h-4 w-4" />
            }
            title="Regra de recorrência"
            description="Configure quando os atendimentos deverão acontecer."
          >
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Frequência

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <select
                  value={
                    frequencyType
                  }
                  onChange={(
                    event,
                  ) =>
                    handleFrequencyChange(
                      event.target
                        .value as RecurrenceFrequencyType,
                    )
                  }
                  disabled={
                    pending
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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
                  {WEEKDAYS.map(
                    (day) => {
                      const selected =
                        daysOfWeek.includes(
                          day.value,
                        );

                      return (
                        <button
                          key={
                            day.value
                          }
                          type="button"
                          disabled={
                            pending
                          }
                          onClick={() =>
                            toggleWeekday(
                              day.value,
                            )
                          }
                          aria-pressed={
                            selected
                          }
                          className={[
                            "relative h-11 rounded-xl",
                            "border text-sm font-semibold",
                            "transition",
                            "disabled:cursor-not-allowed disabled:opacity-60",

                            selected
                              ? [
                                  "border-sky-500",
                                  "bg-sky-50",
                                  "text-sky-700",
                                  "ring-1 ring-sky-100",
                                ].join(
                                  " ",
                                )
                              : [
                                  "border-slate-200",
                                  "bg-white",
                                  "text-slate-600",
                                  "hover:border-sky-300",
                                  "hover:bg-slate-50",
                                ].join(
                                  " ",
                                ),
                          ].join(
                            " ",
                          )}
                        >
                          {selected && (
                            <Check className="absolute right-1.5 top-1.5 h-3 w-3" />
                          )}

                          {
                            day.shortLabel
                          }
                        </button>
                      );
                    },
                  )}
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
                  value={
                    dayOfMonth
                  }
                  disabled={
                    pending
                  }
                  onChange={(
                    event,
                  ) =>
                    setDayOfMonth(
                      Math.min(
                        31,

                        Math.max(
                          1,

                          Math.floor(
                            Number(
                              event
                                .target
                                .value ||
                                1,
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
                Resumo da
                recorrência
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {
                  recurrencePreview
                }
              </p>
            </div>
          </ServicePlanFormSection>

          <ServicePlanFormSection
            icon={
              <Settings2 className="h-4 w-4" />
            }
            title="Configuração da execução"
            description="Defina o técnico e os registros exigidos durante os atendimentos."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Técnico
                  preferencial
                </label>

                <select
                  value={
                    preferredEmployeeUserId
                  }
                  onChange={(
                    event,
                  ) =>
                    setPreferredEmployeeUserId(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    pending
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    Sem técnico
                    preferencial
                  </option>

                  {technicians.map(
                    (
                      technician,
                    ) => (
                      <option
                        key={
                          technician.id
                        }
                        value={
                          technician.id
                        }
                      >
                        {
                          technician.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Checklist da
                  visita
                </label>

                <select
                  value={
                    checklistTemplateId
                  }
                  onChange={(
                    event,
                  ) =>
                    setChecklistTemplateId(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    pending
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    Usar checklist
                    padrão ativo
                  </option>

                  {checklistTemplates.map(
                    (
                      template,
                    ) => (
                      <option
                        key={
                          template.id
                        }
                        value={
                          template.id
                        }
                      >
                        {
                          template.name
                        }

                        {template
                          .itemsCount
                          ? ` — ${template.itemsCount} itens`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Template de
                  medição
                </label>

                <select
                  value={
                    measurementTemplateId
                  }
                  onChange={(
                    event,
                  ) =>
                    setMeasurementTemplateId(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    pending
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    Usar template
                    padrão ativo
                  </option>

                  {measurementTemplates.map(
                    (
                      template,
                    ) => (
                      <option
                        key={
                          template.id
                        }
                        value={
                          template.id
                        }
                      >
                        {
                          template.name
                        }

                        {template
                          .fieldsCount
                          ? ` — ${template.fieldsCount} campos`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Descrição da
                  rotina
                </label>

                <Textarea
                  value={
                    description
                  }
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Ex.: Limpeza completa, aspiração, escovação e análise da água."
                  rows={4}
                  disabled={
                    pending
                  }
                  className="min-h-[104px] resize-y rounded-xl"
                />
              </div>
            </div>
          </ServicePlanFormSection>
        </div>
      </section>

      <FormActionBar
        primaryLabel="Enviar para aprovação"
        loadingLabel="Enviando..."
        pending={pending}
        disabled={!isFormValid}
        onBack={onCancel}
        onCancel={onCancel}
        submitType="button"
        onPrimaryAction={
          handleSubmit
        }
      />
    </div>
  );
}