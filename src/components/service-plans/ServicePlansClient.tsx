"use client";

import * as React from "react";

import {
  CalendarClock,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type {
  WorkOrderChecklistTemplateOption,
  WorkOrderCustomerOption,
  WorkOrderMeasurementTemplateOption,
  WorkOrderTechnicianOption,
} from "@/app/(private)/workorders/actions";

import {
  createServicePlan,
  updateServicePlanStatus,
  type SaveServicePlanInput,
  type ServicePlan,
} from "@/app/(private)/service-plans/actions";

import {
  normalizeSearchText,
  recurrenceLabel,
  statusLabel,
} from "@/app/(private)/service-plans/service-plans.helpers";

import { ServicePlanForm } from "./ServicePlanForm";
import ServicePlanList from "./ServicePlanList";

type ServicePlansClientProps = {
  initialPlans: ServicePlan[];

  customers:
    WorkOrderCustomerOption[];

  technicians:
    WorkOrderTechnicianOption[];

  checklistTemplates:
    WorkOrderChecklistTemplateOption[];

  measurementTemplates:
    WorkOrderMeasurementTemplateOption[];
};

export default function ServicePlansClient({
  initialPlans,
  customers,
  technicians,
  checklistTemplates,
  measurementTemplates,
}: ServicePlansClientProps) {
  const [
    pending,
    startTransition,
  ] = React.useTransition();

  const [
    plans,
    setPlans,
  ] = React.useState<
    ServicePlan[]
  >(initialPlans);

  const [
    searchQuery,
    setSearchQuery,
  ] = React.useState("");

  const [
    showForm,
    setShowForm,
  ] = React.useState(false);

  React.useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const customerNameById =
    React.useMemo(() => {
      return new Map(
        customers.map(
          (customer) => [
            customer.id,
            customer.name,
          ],
        ),
      );
    }, [customers]);

  const getPlanCustomerName =
    React.useCallback(
      (plan: ServicePlan) => {
        const currentCustomerName =
          plan.customerId
            ? customerNameById.get(
                plan.customerId,
              )
            : undefined;

        return (
          currentCustomerName ||
          plan.customerName ||
          "Cliente não informado"
        );
      },
      [customerNameById],
    );

  const totalPlansCount =
    plans.length;

  const pendingPlansCount =
    React.useMemo(() => {
      return plans.filter(
        (plan) =>
          plan.status ===
          "PENDING_APPROVAL",
      ).length;
    }, [plans]);

  const activePlansCount =
    React.useMemo(() => {
      return plans.filter(
        (plan) =>
          plan.status ===
          "ACTIVE",
      ).length;
    }, [plans]);

  const pausedPlansCount =
    React.useMemo(() => {
      return plans.filter(
        (plan) =>
          plan.status ===
          "PAUSED",
      ).length;
    }, [plans]);

  const filteredPlans =
    React.useMemo(() => {
      const normalizedQuery =
        normalizeSearchText(
          searchQuery.trim(),
        );

      if (!normalizedQuery) {
        return plans;
      }

      return plans.filter(
        (plan) => {
          const searchableContent =
            normalizeSearchText(
              [
                plan.title,
                plan.description,

                getPlanCustomerName(
                  plan,
                ),

                statusLabel(
                  plan.status,
                ),

                recurrenceLabel(
                  plan,
                ),
              ]
                .filter(Boolean)
                .join(" "),
            );

          return searchableContent.includes(
            normalizedQuery,
          );
        },
      );
    }, [
      getPlanCustomerName,
      plans,
      searchQuery,
    ]);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openForm() {
    setSearchQuery("");
    setShowForm(true);

    requestAnimationFrame(
      scrollToTop,
    );
  }

  function closeForm() {
    if (pending) {
      return;
    }

    setShowForm(false);

    requestAnimationFrame(
      scrollToTop,
    );
  }

  function handleCreate(
    input: SaveServicePlanInput,
  ) {
    startTransition(async () => {
      try {
        const selectedCustomer =
          customers.find(
            (customer) =>
              customer.id ===
              input.customerId,
          );

        const created =
          await createServicePlan(
            input,
          );

        const createdWithCustomer:
          ServicePlan = {
          ...created,

          customerId:
            created.customerId ||
            selectedCustomer?.id ||
            input.customerId,

          customerName:
            selectedCustomer?.name ||
            created.customerName ||
            "Cliente não informado",

          customerAddressId:
            created.customerAddressId ||
            selectedCustomer
              ?.customerAddressId ||
            input.customerAddressId,

          title:
            created.title ||
            input.title,

          description:
            created.description ??
            input.description ??
            null,

          startDate:
            created.startDate ||
            input.startDate,

          recurrence:
            created.recurrence ||
            input.recurrence,

          status:
            created.status ||
            "PENDING_APPROVAL",
        };

        setPlans((current) => [
          createdWithCustomer,

          ...current.filter(
            (plan) =>
              plan.id !==
              createdWithCustomer.id,
          ),
        ]);

        setShowForm(false);

        toast.success(
          "Rotina enviada para aprovação do cliente.",
        );

        requestAnimationFrame(
          scrollToTop,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a rotina.",
        );
      }
    });
  }

  function handleStatusChange(
    plan: ServicePlan,
    status:
      | "ACTIVE"
      | "PAUSED",
  ) {
    startTransition(async () => {
      try {
        const updated =
          await updateServicePlanStatus(
            plan.id,
            status,
          );

        const updatedWithCustomer:
          ServicePlan = {
          ...plan,
          ...updated,

          customerId:
            updated.customerId ||
            plan.customerId,

          customerName:
            updated.customerName ||
            plan.customerName ||
            getPlanCustomerName(
              plan,
            ),

          customerAddressId:
            updated.customerAddressId ||
            plan.customerAddressId,

          title:
            updated.title ||
            plan.title,

          description:
            updated.description ??
            plan.description,

          startDate:
            updated.startDate ||
            plan.startDate,

          recurrence:
            updated.recurrence ||
            plan.recurrence,

          status,
        };

        setPlans((current) =>
          current.map((item) =>
            item.id ===
            updatedWithCustomer.id
              ? updatedWithCustomer
              : item,
          ),
        );

        toast.success(
          status === "ACTIVE"
            ? "Rotina reativada com sucesso."
            : "Rotina pausada com sucesso.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a rotina.",
        );
      }
    });
  }

  if (showForm) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 pb-8">
        <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarClock className="h-5 w-5" />
            </div>

            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Atendimento recorrente
              </div>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Nova Rotina de Atendimento
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Configure o atendimento
                recorrente que será
                enviado ao cliente para
                aprovação.
              </p>
            </div>
          </div>
        </header>

        <ServicePlanForm
          customers={customers}
          technicians={technicians}
          checklistTemplates={
            checklistTemplates
          }
          measurementTemplates={
            measurementTemplates
          }
          pending={pending}
          onCancel={closeForm}
          onSubmit={handleCreate}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarClock className="h-5 w-5" />
            </div>

            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Atendimentos recorrentes
              </div>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Rotinas de Atendimento
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Acompanhe as rotinas
                cadastradas, aprovações e
                atendimentos recorrentes
                da empresa.
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="btn-brand h-10 rounded-xl px-5 text-white"
            onClick={openForm}
            disabled={pending}
          >
            <Plus className="mr-2 h-4 w-4" />

            Nova rotina
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total de rotinas
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totalPlansCount}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Aguardando aprovação
          </div>

          <div className="mt-2 text-2xl font-bold text-blue-800">
            {pendingPlansCount}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Rotinas ativas
          </div>

          <div className="mt-2 text-2xl font-bold text-emerald-800">
            {activePlansCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Rotinas pausadas
          </div>

          <div className="mt-2 text-2xl font-bold text-amber-800">
            {pausedPlansCount}
          </div>
        </div>
      </section>

      <ServicePlanList
        plans={plans}
        filteredPlans={
          filteredPlans
        }
        searchQuery={
          searchQuery
        }
        pending={pending}
        getCustomerName={
          getPlanCustomerName
        }
        onSearchChange={
          setSearchQuery
        }
        onClearSearch={() =>
          setSearchQuery("")
        }
        onCreateFirst={
          openForm
        }
        onStatusChange={
          handleStatusChange
        }
      />
    </div>
  );
}