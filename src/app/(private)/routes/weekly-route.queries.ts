"use server";

import { listServicePlans } from "@/app/(private)/service-plans/actions";
import { fetchWeeklyRouteTemplates } from "./weekly-route.api";
import { ALL_ROUTE_WEEKDAYS } from "./weekly-route.constants";
import {
  normalizePlanningService,
  normalizeWeeklyTemplate,
} from "./weekly-route.normalizers";
import type {
  WeeklyRoutePlanningService,
  WeeklyRouteTemplate,
} from "./weekly-route.types";

export async function listWeeklyRoutePlanningServices(): Promise<
  WeeklyRoutePlanningService[]
> {
  const plans = await listServicePlans({ status: "ACTIVE" });

  return plans
    .map(normalizePlanningService)
    .filter((plan) => plan.weekdays.length > 0)
    .sort((first, second) => first.customerName.localeCompare(second.customerName, "pt-BR"));
}

export async function listWeeklyRouteTemplates(): Promise<WeeklyRouteTemplate[]> {
  const templates = await fetchWeeklyRouteTemplates();

  return templates
    .map(normalizeWeeklyTemplate)
    .filter(
      (template) =>
        Boolean(template.employeeUserId) && ALL_ROUTE_WEEKDAYS.includes(template.weekday),
    );
}
