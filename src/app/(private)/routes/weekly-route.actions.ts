"use server";

import { revalidatePath } from "next/cache";

import { listServicePlans } from "@/app/(private)/service-plans/actions";

import type { RouteWeekday } from "./routes.types";

import { fetchWeeklyRouteTemplates, saveWeeklyRouteTemplateApi } from "./weekly-route.api";

import type {
  SaveWeeklyRouteTemplateInput,
  SaveWeeklyRouteTemplateResult,
  WeeklyRoutePlanningService,
  WeeklyRouteTemplate,
} from "./weekly-route.types";

export type {
  SaveWeeklyRouteTemplateInput,
  SaveWeeklyRouteTemplateResult,
  WeeklyRoutePlanningService,
  WeeklyRouteTemplate,
};

const WEEKDAY_BY_NUMBER: Record<number, RouteWeekday> = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  7: "SUNDAY",
};

const ALL_ROUTE_WEEKDAYS: RouteWeekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function normalizeWeeklyTemplate(template: WeeklyRouteTemplate): WeeklyRouteTemplate {
  return {
    id: template.id ?? null,
    employeeUserId: template.employeeUserId || "",
    weekday: template.weekday,
    updatedAt: template.updatedAt ?? null,
    items: [...(template.items || [])]
      .filter((item) => Boolean(item.servicePlanId))
      .map((item, index) => ({
        servicePlanId: item.servicePlanId,
        executionOrder: Number.isFinite(item.executionOrder) && item.executionOrder > 0 ? Math.floor(item.executionOrder) : index + 1,
      }))
      .sort((first, second) => first.executionOrder - second.executionOrder),
  };
}

export async function listWeeklyRoutePlanningServices(): Promise<WeeklyRoutePlanningService[]> {
  const plans = await listServicePlans({
    status: "ACTIVE",
  });

  return plans
    .map((plan) => {
      let weekdays: RouteWeekday[] = [];

      if (plan.recurrence.frequencyType === "DAILY") {
        weekdays = [...ALL_ROUTE_WEEKDAYS];
      } else if (plan.recurrence.frequencyType === "WEEKLY" && plan.recurrence.intervalValue === 1) {
        weekdays = plan.recurrence.daysOfWeek
          .map((day) => WEEKDAY_BY_NUMBER[day])
          .filter((day): day is RouteWeekday => Boolean(day));
      }

      return {
        id: plan.id,
        customerName: plan.customerName,
        title: plan.title,
        preferredEmployeeUserId: plan.preferredEmployeeUserId || "",
        weekdays,
      } satisfies WeeklyRoutePlanningService;
    })
    .filter((plan) => plan.weekdays.length > 0)
    .sort((first, second) => first.customerName.localeCompare(second.customerName, "pt-BR"));
}

export async function listWeeklyRouteTemplates(): Promise<WeeklyRouteTemplate[]> {
  try {
    const templates = await fetchWeeklyRouteTemplates();

    return templates
      .map(normalizeWeeklyTemplate)
      .filter((template) => Boolean(template.employeeUserId) && ALL_ROUTE_WEEKDAYS.includes(template.weekday));
  } catch (error) {
    console.error("[listWeeklyRouteTemplates]", error);

    return [];
  }
}

export async function saveWeeklyRouteTemplate(input: SaveWeeklyRouteTemplateInput): Promise<SaveWeeklyRouteTemplateResult> {
  try {
    if (!input.employeeUserId) {
      throw new Error("Selecione o técnico responsável.");
    }

    if (!ALL_ROUTE_WEEKDAYS.includes(input.weekday)) {
      throw new Error("Selecione um dia da semana válido.");
    }

    const servicePlanIds = Array.from(
      new Set(
        input.items
          .map((item) => item.servicePlanId)
          .filter(Boolean),
      ),
    );

    const payload: SaveWeeklyRouteTemplateInput = {
      employeeUserId: input.employeeUserId,
      weekday: input.weekday,
      items: servicePlanIds.map((servicePlanId, index) => ({
        servicePlanId,
        executionOrder: index + 1,
      })),
    };

    const template = await saveWeeklyRouteTemplateApi(payload);

    revalidatePath("/routes/builder");
    revalidatePath("/routes/dashboard");

    return {
      ok: true,
      template: normalizeWeeklyTemplate(template),
    };
  } catch (error) {
    console.error("[saveWeeklyRouteTemplate]", error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível salvar a rota padrão.",
    };
  }
}