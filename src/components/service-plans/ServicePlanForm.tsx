"use client";

import * as React from "react";

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

import { DEFAULT_GENERATE_DAYS_AHEAD } from "@/app/(private)/service-plans/service-plans.constants";

import {
  getRecurrencePreview,
  todayIso,
} from "@/app/(private)/service-plans/service-plans.helpers";

import FormActionBar from "@/components/ui/FormActionBar";

import { ServicePlanExecutionSection } from "./ServicePlanExecutionSection";
import { ServicePlanIdentitySection } from "./ServicePlanIdentitySection";
import { ServicePlanRecurrenceSection } from "./ServicePlanRecurrenceSection";
import { ServicePlanStartValueSection } from "./ServicePlanStartValueSection";

type ServicePlanFormProps = {
  customers: WorkOrderCustomerOption[];
  technicians: WorkOrderTechnicianOption[];
  checklistTemplates: WorkOrderChecklistTemplateOption[];
  measurementTemplates: WorkOrderMeasurementTemplateOption[];
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: SaveServicePlanInput) => void;
};

function parseMonthlyAmount(value: string) {
  const sanitizedValue = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const parsedValue = Number(sanitizedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

export function ServicePlanForm({
  customers,
  technicians,
  checklistTemplates,
  measurementTemplates,
  pending,
  onCancel,
  onSubmit,
}: ServicePlanFormProps) {
  const [customerId, setCustomerId] =
    React.useState("");

  const [title, setTitle] =
    React.useState("");

  const [description, setDescription] =
    React.useState("");

  const [startDate, setStartDate] =
    React.useState(todayIso());

  const [totalAmount, setTotalAmount] =
    React.useState("");

  const [frequencyType, setFrequencyType] =
    React.useState<RecurrenceFrequencyType>(
      "WEEKLY",
    );

  const [daysOfWeek, setDaysOfWeek] =
    React.useState<number[]>([1]);

  const [dayOfMonth, setDayOfMonth] =
    React.useState(1);

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

  const normalizedAmount = React.useMemo(
    () => parseMonthlyAmount(totalAmount),
    [totalAmount],
  );

  const recurrencePreview = React.useMemo(
    () =>
      getRecurrencePreview({
        frequencyType,
        intervalValue: 1,
        dayOfMonth,
        daysOfWeek,
      }),
    [
      dayOfMonth,
      daysOfWeek,
      frequencyType,
    ],
  );

  const isCustomerValid =
    selectedCustomer?.hasValidAddress === true;

  const isWeeklyRecurrenceValid =
    frequencyType !== "WEEKLY" ||
    daysOfWeek.length > 0;

  const isMonthlyRecurrenceValid =
    frequencyType !== "MONTHLY" ||
    (Number.isInteger(dayOfMonth) &&
      dayOfMonth >= 1 &&
      dayOfMonth <= 31);

  const isFormValid =
    isCustomerValid &&
    title.trim().length > 0 &&
    Boolean(startDate) &&
    normalizedAmount > 0 &&
    isWeeklyRecurrenceValid &&
    isMonthlyRecurrenceValid;

  function toggleWeekday(day: number) {
    setDaysOfWeek((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter(
          (currentDay) =>
            currentDay !== day,
        );
      }

      return [...currentDays, day].sort(
        (firstDay, secondDay) =>
          firstDay - secondDay,
      );
    });
  }

  function handleFrequencyChange(
    nextFrequency: RecurrenceFrequencyType,
  ) {
    setFrequencyType(nextFrequency);

    if (
      nextFrequency === "WEEKLY" &&
      daysOfWeek.length === 0
    ) {
      setDaysOfWeek([1]);
    }

    if (nextFrequency === "MONTHLY") {
      const startDay = Number(
        startDate.slice(8, 10),
      );

      setDayOfMonth(
        startDay >= 1 && startDay <= 31
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
        selectedCustomer.customerAddressId,

      title: title.trim(),
      description: description.trim(),

      startDate,
      endDate: undefined,
      totalAmount: normalizedAmount,

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
          frequencyType === "WEEKLY"
            ? daysOfWeek
            : [],

        dayOfMonth:
          frequencyType === "MONTHLY"
            ? dayOfMonth
            : null,

        generateDaysAhead:
          DEFAULT_GENERATE_DAYS_AHEAD,
      },
    });
  }

  return (
    <div className="space-y-5 pb-28">
      <ServicePlanIdentitySection
        customers={customers}
        customerId={customerId}
        selectedCustomer={selectedCustomer}
        title={title}
        pending={pending}
        onCustomerChange={setCustomerId}
        onTitleChange={setTitle}
      />

      <ServicePlanStartValueSection
        startDate={startDate}
        totalAmount={totalAmount}
        pending={pending}
        onStartDateChange={setStartDate}
        onTotalAmountChange={setTotalAmount}
      />

      <ServicePlanRecurrenceSection
        frequencyType={frequencyType}
        daysOfWeek={daysOfWeek}
        dayOfMonth={dayOfMonth}
        recurrencePreview={recurrencePreview}
        pending={pending}
        onFrequencyChange={
          handleFrequencyChange
        }
        onToggleWeekday={toggleWeekday}
        onDayOfMonthChange={setDayOfMonth}
      />

      <ServicePlanExecutionSection
        technicians={technicians}
        checklistTemplates={
          checklistTemplates
        }
        measurementTemplates={
          measurementTemplates
        }
        preferredEmployeeUserId={
          preferredEmployeeUserId
        }
        checklistTemplateId={
          checklistTemplateId
        }
        measurementTemplateId={
          measurementTemplateId
        }
        description={description}
        pending={pending}
        onPreferredEmployeeChange={
          setPreferredEmployeeUserId
        }
        onChecklistTemplateChange={
          setChecklistTemplateId
        }
        onMeasurementTemplateChange={
          setMeasurementTemplateId
        }
        onDescriptionChange={
          setDescription
        }
      />

      <FormActionBar
        primaryLabel="Enviar para aprovação"
        loadingLabel="Enviando..."
        pending={pending}
        disabled={!isFormValid}
        onBack={onCancel}
        onCancel={onCancel}
        submitType="button"
        onPrimaryAction={handleSubmit}
      />
    </div>
  );
}