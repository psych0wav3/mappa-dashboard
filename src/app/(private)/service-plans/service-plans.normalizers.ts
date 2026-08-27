import type {
  ApiServicePlan,
  RecurrenceFrequencyType,
  ServicePlan,
  ServicePlanStatus,
} from "./service-plans.types";

export function toApiDate(
  value?: string,
) {
  if (!value) {
    return null;
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return value;
  }

  if (
    /^\d{2}\/\d{2}\/\d{4}$/.test(
      value,
    )
  ) {
    const [
      day,
      month,
      year,
    ] = value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(
    0,
    10,
  );
}

export function normalizeFrequency(
  value?: string | null,
): RecurrenceFrequencyType {
  const normalized =
    String(
      value || "WEEKLY",
    )
      .replace(
        /[_\s-]/g,
        "",
      )
      .toUpperCase();

  if (
    normalized === "DAILY"
  ) {
    return "DAILY";
  }

  if (
    normalized === "MONTHLY"
  ) {
    return "MONTHLY";
  }

  return "WEEKLY";
}

export function normalizeStatus(
  value?: string | null,
): ServicePlanStatus {
  const normalized =
    String(
      value ||
        "PENDING_APPROVAL",
    )
      .replace(
        /[_\s-]/g,
        "",
      )
      .toUpperCase();

  if (
    normalized ===
    "PENDINGAPPROVAL"
  ) {
    return "PENDING_APPROVAL";
  }

  if (
    normalized === "ACTIVE"
  ) {
    return "ACTIVE";
  }

  if (
    normalized === "PAUSED"
  ) {
    return "PAUSED";
  }

  if (
    normalized ===
      "CANCELED" ||
    normalized ===
      "CANCELLED"
  ) {
    return "CANCELED";
  }

  if (
    normalized ===
    "FINISHED"
  ) {
    return "FINISHED";
  }

  return "PENDING_APPROVAL";
}

export function toApiStatus(
  value: ServicePlanStatus,
) {
  const values: Record<
    ServicePlanStatus,
    string
  > = {
    PENDING_APPROVAL:
      "PendingApproval",

    ACTIVE:
      "Active",

    PAUSED:
      "Paused",

    CANCELED:
      "Canceled",

    FINISHED:
      "Finished",
  };

  return values[value];
}

export function positiveInteger(
  value:
    | number
    | null
    | undefined,
  fallback: number,
) {
  const normalized =
    Number(value);

  if (
    !Number.isFinite(
      normalized,
    ) ||
    normalized <= 0
  ) {
    return fallback;
  }

  return Math.floor(
    normalized,
  );
}

export function normalizeDaysOfWeek(
  value?: number[] | null,
) {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(Number)
        .filter(
          (day) =>
            Number.isInteger(
              day,
            ) &&
            day >= 1 &&
            day <= 7,
        ),
    ),
  ).sort(
    (
      first,
      second,
    ) =>
      first - second,
  );
}

export function normalizePlan(
  plan: ApiServicePlan,
): ServicePlan {
  const frequencyType =
    normalizeFrequency(
      plan.recurrence
        ?.frequencyType,
    );

  return {
    id:
      plan.id,

    customerId:
      plan.customerId ??
      null,

    customerName:
      plan.customerName ||
      "Cliente não informado",

    customerAddressId:
      plan.customerAddressId ??
      null,

    checklistTemplateId:
      plan.checklistTemplateId ??
      null,

    measurementTemplateId:
      plan.measurementTemplateId ??
      null,

    preferredEmployeeUserId:
      plan.preferredEmployeeUserId ??
      null,

    title:
      plan.title ||
      "Rotina de atendimento",

    description:
      plan.description ??
      null,

    startDate:
      plan.startDate ??
      null,

    endDate:
      plan.endDate ??
      null,

    totalAmount:
      typeof plan.totalAmount ===
        "number" &&
      Number.isFinite(
        plan.totalAmount,
      )
        ? plan.totalAmount
        : null,

    status:
      normalizeStatus(
        plan.status,
      ),

    createdAt:
      plan.createdAt ??
      null,

    recurrence: {
      frequencyType,

      intervalValue:
        positiveInteger(
          plan.recurrence
            ?.intervalValue,
          1,
        ),

      daysOfWeek:
        frequencyType ===
        "WEEKLY"
          ? normalizeDaysOfWeek(
              plan.recurrence
                ?.daysOfWeek,
            )
          : [],

      dayOfMonth:
        frequencyType ===
        "MONTHLY"
          ? plan.recurrence
              ?.dayOfMonth ??
            null
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

