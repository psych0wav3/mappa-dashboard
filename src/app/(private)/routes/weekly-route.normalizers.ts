import { ALL_ROUTE_WEEKDAYS, WEEKDAY_BY_NUMBER } from "./weekly-route.constants";
import type { RouteWeekday } from "./routes.types";
import type {
  WeeklyRoutePlanningService,
  WeeklyRouteTemplate,
} from "./weekly-route.types";
import type { ServicePlan } from "../service-plans/actions";

export function normalizeWeeklyTemplate(
  template: WeeklyRouteTemplate,
): WeeklyRouteTemplate {
  return {
    id: template.id ?? null,
    employeeUserId: template.employeeUserId || "",
    weekday: template.weekday,
    updatedAt: template.updatedAt ?? null,
    items: [...(template.items || [])]
      .filter((item) => Boolean(item.servicePlanId))
      .map((item, index) => ({
        servicePlanId: item.servicePlanId,
        executionOrder:
          Number.isFinite(item.executionOrder) && item.executionOrder > 0
            ? Math.floor(item.executionOrder)
            : index + 1,
      }))
      .sort((first, second) => first.executionOrder - second.executionOrder),
  };
}

export function normalizePlanningService(plan: ServicePlan): WeeklyRoutePlanningService {
  let weekdays: RouteWeekday[] = [];

  if (plan.recurrence.frequencyType === "DAILY") {
    weekdays = [...ALL_ROUTE_WEEKDAYS];
  } else if (
    plan.recurrence.frequencyType === "WEEKLY" &&
    plan.recurrence.intervalValue === 1
  ) {
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
  };
}
