"use server";

import { revalidatePath } from "next/cache";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type ServicePlanStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELED"
  | "FINISHED";

export type RecurrenceFrequencyType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

export type ServicePlanRecurrence = {
  frequencyType: RecurrenceFrequencyType;
  intervalValue: number;
  daysOfWeek: number[];
  dayOfMonth?: number | null;
  generateDaysAhead: number;
};

export type ServicePlan = {
  id: string;
  customerId?: string | null;
  customerName: string;
  customerAddressId?: string | null;
  checklistTemplateId?: string | null;
  measurementTemplateId?: string | null;
  preferredEmployeeUserId?: string | null;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalAmount?: number | null;
  status: ServicePlanStatus;
  createdAt?: string | null;
  recurrence: ServicePlanRecurrence;
};

type ApiRecurrence = {
  frequencyType?: string | null;
  intervalValue?: number | null;
  daysOfWeek?: number[] | null;
  dayOfMonth?: number | null;
  generateDaysAhead?: number | null;
};

type ApiServicePlan = {
  id: string;
  customerId?: string | null;
  customerName?: string | null;
  customerAddressId?: string | null;
  checklistTemplateId?: string | null;
  measurementTemplateId?: string | null;
  preferredEmployeeUserId?: string | null;
  title?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  createdAt?: string | null;
  recurrence?: ApiRecurrence | null;
};

export type SaveServicePlanInput = {
  customerId: string;
  customerAddressId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  totalAmount: number;
  checklistTemplateId?: string;
  measurementTemplateId?: string;
  preferredEmployeeUserId?: string;
  recurrence: ServicePlanRecurrence;
};

function toApiDate(value?: string) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] =
      value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function normalizeFrequency(
  value?: string | null,
): RecurrenceFrequencyType {
  const normalized = String(
    value || "WEEKLY",
  )
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  if (normalized === "DAILY") {
    return "DAILY";
  }

  if (normalized === "MONTHLY") {
    return "MONTHLY";
  }

  return "WEEKLY";
}

function normalizeStatus(
  value?: string | null,
): ServicePlanStatus {
  const normalized = String(
    value || "PENDING_APPROVAL",
  )
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  if (normalized === "PENDINGAPPROVAL") {
    return "PENDING_APPROVAL";
  }

  if (normalized === "ACTIVE") {
    return "ACTIVE";
  }

  if (normalized === "PAUSED") {
    return "PAUSED";
  }

  if (
    normalized === "CANCELED" ||
    normalized === "CANCELLED"
  ) {
    return "CANCELED";
  }

  if (normalized === "FINISHED") {
    return "FINISHED";
  }

  return "PENDING_APPROVAL";
}

function toApiStatus(
  value: ServicePlanStatus,
) {
  const values: Record<
    ServicePlanStatus,
    string
  > = {
    PENDING_APPROVAL:
      "PendingApproval",
    ACTIVE: "Active",
    PAUSED: "Paused",
    CANCELED: "Canceled",
    FINISHED: "Finished",
  };

  return values[value];
}

function positiveInteger(
  value: number | null | undefined,
  fallback: number,
) {
  const normalized = Number(value);

  if (
    !Number.isFinite(normalized) ||
    normalized <= 0
  ) {
    return fallback;
  }

  return Math.floor(normalized);
}

function normalizeDaysOfWeek(
  value?: number[] | null,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(Number)
        .filter(
          (day) =>
            Number.isInteger(day) &&
            day >= 1 &&
            day <= 7,
        ),
    ),
  ).sort(
    (first, second) =>
      first - second,
  );
}

function normalizePlan(
  plan: ApiServicePlan,
): ServicePlan {
  const frequencyType =
    normalizeFrequency(
      plan.recurrence?.frequencyType,
    );

  return {
    id: plan.id,

    customerId:
      plan.customerId ?? null,

    customerName:
      plan.customerName ||
      "Cliente não informado",

    customerAddressId:
      plan.customerAddressId ?? null,

    checklistTemplateId:
      plan.checklistTemplateId ?? null,

    measurementTemplateId:
      plan.measurementTemplateId ?? null,

    preferredEmployeeUserId:
      plan.preferredEmployeeUserId ?? null,

    title:
      plan.title ||
      "Rotina de atendimento",

    description:
      plan.description ?? null,

    startDate:
      plan.startDate ?? null,

    endDate:
      plan.endDate ?? null,

    totalAmount:
      typeof plan.totalAmount === "number" &&
      Number.isFinite(plan.totalAmount)
        ? plan.totalAmount
        : null,

    status:
      normalizeStatus(plan.status),

    createdAt:
      plan.createdAt ?? null,

    recurrence: {
      frequencyType,

      intervalValue:
        positiveInteger(
          plan.recurrence?.intervalValue,
          1,
        ),

      daysOfWeek:
        frequencyType === "WEEKLY"
          ? normalizeDaysOfWeek(
              plan.recurrence
                ?.daysOfWeek,
            )
          : [],

      dayOfMonth:
        frequencyType === "MONTHLY"
          ? plan.recurrence
              ?.dayOfMonth ?? null
          : null,

      generateDaysAhead:
        positiveInteger(
          plan.recurrence
            ?.generateDaysAhead,
          30,
        ),
    },
  };
}

function validateInput(
  input: SaveServicePlanInput,
) {
  if (!input.customerId) {
    throw new Error(
      "Selecione o cliente/piscina.",
    );
  }

  if (!input.customerAddressId) {
    throw new Error(
      "O cliente selecionado não possui endereço válido.",
    );
  }

  if (!input.title.trim()) {
    throw new Error(
      "Informe o nome da rotina.",
    );
  }

  if (!input.startDate) {
    throw new Error(
      "Informe a data de início.",
    );
  }

  if (
    input.endDate &&
    input.endDate < input.startDate
  ) {
    throw new Error(
      "A data final não pode ser anterior à data inicial.",
    );
  }

  const totalAmount =
    Number(input.totalAmount);

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {
    throw new Error(
      "Informe um valor maior que zero.",
    );
  }

  const recurrence = input.recurrence;

  if (
    !Number.isInteger(
      recurrence.intervalValue,
    ) ||
    recurrence.intervalValue <= 0
  ) {
    throw new Error(
      "O intervalo deve ser maior que zero.",
    );
  }

  if (
    recurrence.frequencyType ===
      "WEEKLY" &&
    recurrence.daysOfWeek.length === 0
  ) {
    throw new Error(
      "Selecione pelo menos um dia da semana.",
    );
  }

  if (
    recurrence.frequencyType ===
    "WEEKLY"
  ) {
    const hasInvalidDay =
      recurrence.daysOfWeek.some(
        (day) =>
          !Number.isInteger(day) ||
          day < 1 ||
          day > 7,
      );

    if (hasInvalidDay) {
      throw new Error(
        "Os dias da semana devem estar entre 1 e 7.",
      );
    }
  }

  if (
    recurrence.frequencyType ===
    "MONTHLY"
  ) {
    if (
      !recurrence.dayOfMonth ||
      recurrence.dayOfMonth < 1 ||
      recurrence.dayOfMonth > 31
    ) {
      throw new Error(
        "Informe um dia do mês entre 1 e 31.",
      );
    }
  }
}

function buildCreatePayload(
  input: SaveServicePlanInput,
) {
  validateInput(input);

  const recurrence = input.recurrence;

  return {
    customerId:
      input.customerId,

    customerAddressId:
      input.customerAddressId,

    title:
      input.title.trim(),

    description:
      input.description?.trim() || "",

    startDate:
      toApiDate(input.startDate),

    endDate:
      toApiDate(input.endDate),

    items: [
      {
        type: "SERVICE",
        description:
          input.title.trim() ||
          "Mensalidade da rotina",
        quantity: 1,
        unitPrice: Number(
          input.totalAmount,
        ),
      },
    ],

    checklistTemplateId:
      input.checklistTemplateId ||
      null,

    measurementTemplateId:
      input.measurementTemplateId ||
      null,

    preferredEmployeeUserId:
      input.preferredEmployeeUserId ||
      null,

    recurrence: {
      frequencyType:
        recurrence.frequencyType,

      intervalValue:
        recurrence.intervalValue,

      daysOfWeek:
        recurrence.frequencyType ===
        "WEEKLY"
          ? normalizeDaysOfWeek(
              recurrence.daysOfWeek,
            )
          : [],

      dayOfMonth:
        recurrence.frequencyType ===
        "MONTHLY"
          ? recurrence.dayOfMonth ??
            null
          : null,

      generateDaysAhead:
        positiveInteger(
          recurrence
            .generateDaysAhead,
          30,
        ),
    },
  };
}

export async function listServicePlans(
  filters?: {
    status?: ServicePlanStatus;
    customerId?: string;
  },
): Promise<ServicePlan[]> {
  const companyId =
    await getCompanyId();

  const searchParams =
    new URLSearchParams();

  if (filters?.status) {
    searchParams.set(
      "status",
      toApiStatus(filters.status),
    );
  }

  if (filters?.customerId) {
    searchParams.set(
      "customerId",
      filters.customerId,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/service-plans${
        query ? `?${query}` : ""
      }`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

  const summaries =
    extractItems<ApiServicePlan>(
      response,
    );

  const hydrated =
    await Promise.all(
      summaries.map(
        async (summary) => {
          try {
            const details =
              await mappaFetch<ApiServicePlan>(
                `/api/companies/${companyId}/service-plans/${summary.id}`,
                {
                  method: "GET",
                  cache: "no-store",
                },
              );

            return {
              ...summary,
              ...details,

              customerId:
                details.customerId ||
                summary.customerId,

              customerName:
                details.customerName ||
                summary.customerName,

              title:
                details.title ||
                summary.title,

              status:
                details.status ||
                summary.status,

              recurrence:
                details.recurrence ||
                summary.recurrence,
            };
          } catch {
            return summary;
          }
        },
      ),
    );

  return hydrated.map(normalizePlan);
}

export async function getServicePlanById(
  servicePlanId: string,
): Promise<ServicePlan> {
  if (!servicePlanId) {
    throw new Error(
      "Rotina não informada.",
    );
  }

  const companyId =
    await getCompanyId();

  const response =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans/${servicePlanId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

  return normalizePlan(response);
}

export async function createServicePlan(
  input: SaveServicePlanInput,
): Promise<ServicePlan> {
  const companyId =
    await getCompanyId();

  const payload =
    buildCreatePayload(input);

  const response =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  revalidatePath("/service-plans");
  revalidatePath("/workorders");
  revalidatePath(
    "/workorders/customer-approval",
  );
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");

  return normalizePlan(response);
}

export async function updateServicePlanStatus(
  servicePlanId: string,
  status: "ACTIVE" | "PAUSED",
): Promise<ServicePlan> {
  if (!servicePlanId) {
    throw new Error(
      "Rotina não informada.",
    );
  }

  const companyId =
    await getCompanyId();

  const response =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans/${servicePlanId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status:
            status === "ACTIVE"
              ? "Active"
              : "Paused",
        }),
      },
    );

  revalidatePath("/service-plans");
  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");

  return normalizePlan(response);
}

export async function generateServicePlanOrders(
  servicePlanId: string,
) {
  if (!servicePlanId) {
    throw new Error(
      "Rotina não informada.",
    );
  }

  const companyId =
    await getCompanyId();

  const response =
    await mappaFetch<{
      ordersGenerated?: number;
    }>(
      `/api/companies/${companyId}/service-plans/${servicePlanId}/generate-orders`,
      {
        method: "POST",
      },
    );

  revalidatePath("/service-plans");
  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");
  revalidatePath("/routes/dashboard");

  return {
    ordersGenerated: Number(
      response.ordersGenerated || 0,
    ),
  };
}