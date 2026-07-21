"use server";

import { revalidatePath } from "next/cache";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type ServicePlanStatus =
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
    const [day, month, year] = value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function normalizeFrequency(
  value?: string | null,
): RecurrenceFrequencyType {
  const normalized = String(value || "WEEKLY")
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
  const normalized = String(value || "ACTIVE")
    .replace(/[_\s-]/g, "")
    .toUpperCase();

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

  return "ACTIVE";
}

function normalizePlan(
  plan: ApiServicePlan,
): ServicePlan {
  return {
    id: plan.id,
    customerId: plan.customerId ?? null,
    customerName:
      plan.customerName || "Cliente não informado",
    customerAddressId:
      plan.customerAddressId ?? null,
    checklistTemplateId:
      plan.checklistTemplateId ?? null,
    measurementTemplateId:
      plan.measurementTemplateId ?? null,
    preferredEmployeeUserId:
      plan.preferredEmployeeUserId ?? null,
    title: plan.title || "Plano de serviço",
    description: plan.description ?? null,
    startDate: plan.startDate ?? null,
    endDate: plan.endDate ?? null,
    status: normalizeStatus(plan.status),
    createdAt: plan.createdAt ?? null,

    recurrence: {
      frequencyType: normalizeFrequency(
        plan.recurrence?.frequencyType,
      ),

      intervalValue: Number(
        plan.recurrence?.intervalValue || 1,
      ),

      daysOfWeek: Array.isArray(
        plan.recurrence?.daysOfWeek,
      )
        ? plan.recurrence.daysOfWeek
        : [],

      dayOfMonth:
        plan.recurrence?.dayOfMonth ?? null,

      generateDaysAhead: Number(
        plan.recurrence?.generateDaysAhead || 30,
      ),
    },
  };
}

function validateInput(
  input: SaveServicePlanInput,
) {
  const title = input.title.trim();

  if (!input.customerId) {
    throw new Error("Selecione o cliente.");
  }

  if (!input.customerAddressId) {
    throw new Error(
      "O cliente não possui endereço principal válido.",
    );
  }

  if (!title) {
    throw new Error("Informe o nome do plano.");
  }

  if (!input.startDate) {
    throw new Error(
      "Informe a data inicial do plano.",
    );
  }

  const normalizedStartDate =
    toApiDate(input.startDate);

  const normalizedEndDate =
    toApiDate(input.endDate);

  if (
    normalizedEndDate &&
    normalizedStartDate &&
    normalizedEndDate < normalizedStartDate
  ) {
    throw new Error(
      "A data final não pode ser anterior à data inicial.",
    );
  }

  const recurrence = input.recurrence;

  if (!recurrence) {
    throw new Error(
      "Informe a recorrência do plano.",
    );
  }

  if (recurrence.intervalValue <= 0) {
    throw new Error(
      "O intervalo da recorrência deve ser maior que zero.",
    );
  }

  if (recurrence.generateDaysAhead <= 0) {
    throw new Error(
      "O período de geração deve ser maior que zero.",
    );
  }

  if (
    recurrence.frequencyType === "WEEKLY" &&
    recurrence.daysOfWeek.length === 0
  ) {
    throw new Error(
      "Selecione ao menos um dia da semana.",
    );
  }

  if (
    recurrence.frequencyType === "MONTHLY" &&
    (
      !recurrence.dayOfMonth ||
      recurrence.dayOfMonth < 1 ||
      recurrence.dayOfMonth > 31
    )
  ) {
    throw new Error(
      "Informe um dia do mês entre 1 e 31.",
    );
  }

  return {
    customerId: input.customerId,
    customerAddressId: input.customerAddressId,
    title,
    description:
      input.description?.trim() || "",
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
    checklistTemplateId:
      input.checklistTemplateId || null,
    measurementTemplateId:
      input.measurementTemplateId || null,
    preferredEmployeeUserId:
      input.preferredEmployeeUserId || null,

    recurrence: {
      frequencyType:
        recurrence.frequencyType === "DAILY"
          ? "Daily"
          : recurrence.frequencyType ===
              "MONTHLY"
            ? "Monthly"
            : "Weekly",

      intervalValue: recurrence.intervalValue,

      daysOfWeek:
        recurrence.frequencyType === "WEEKLY"
          ? recurrence.daysOfWeek
          : null,

      dayOfMonth:
        recurrence.frequencyType === "MONTHLY"
          ? recurrence.dayOfMonth
          : null,

      generateDaysAhead:
        recurrence.generateDaysAhead,
    },
  };
}

export async function listServicePlans(): Promise<
  ServicePlan[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/service-plans`,
  );

  const summaries =
    extractItems<ApiServicePlan>(data);

  const hydrated = await Promise.all(
    summaries.map(async (summary) => {
      try {
        return await mappaFetch<ApiServicePlan>(
          `/api/companies/${companyId}/service-plans/${summary.id}`,
        );
      } catch {
        return summary;
      }
    }),
  );

  return hydrated
    .map(normalizePlan)
    .sort((first, second) =>
      String(second.createdAt || "").localeCompare(
        String(first.createdAt || ""),
      ),
    );
}

export async function getServicePlanById(
  servicePlanId: string,
) {
  const companyId = await getCompanyId();

  if (!servicePlanId) {
    throw new Error(
      "ID do plano de serviço não informado.",
    );
  }

  const data = await mappaFetch<ApiServicePlan>(
    `/api/companies/${companyId}/service-plans/${servicePlanId}`,
  );

  return normalizePlan(data);
}

export async function createServicePlan(
  input: SaveServicePlanInput,
) {
  const companyId = await getCompanyId();
  const payload = validateInput(input);

  const created =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  revalidatePath("/service-plans");
  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");

  return normalizePlan(created);
}

export async function updateServicePlanStatus(
  params: {
    servicePlanId: string;
    status: ServicePlanStatus;
  },
) {
  const companyId = await getCompanyId();

  if (!params.servicePlanId) {
    throw new Error(
      "ID do plano de serviço não informado.",
    );
  }

  const apiStatus =
    params.status === "PAUSED"
      ? "Paused"
      : params.status === "CANCELED"
        ? "Canceled"
        : params.status === "FINISHED"
          ? "Finished"
          : "Active";

  const updated =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans/${params.servicePlanId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: apiStatus,
        }),
      },
    );

  revalidatePath("/service-plans");

  return normalizePlan(updated);
}

export async function generateServicePlanOrders(
  servicePlanId: string,
) {
  const companyId = await getCompanyId();

  if (!servicePlanId) {
    throw new Error(
      "ID do plano de serviço não informado.",
    );
  }

  const result = await mappaFetch<{
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

  return {
    ordersGenerated: Number(
      result?.ordersGenerated || 0,
    ),
  };
}