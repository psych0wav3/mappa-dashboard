import type {
  RouteWeekday,
} from "./routes.types";

export type WeeklyRoutePlanningService = {
  id: string;
  customerName: string;
  title: string;
  preferredEmployeeUserId: string;
  weekdays: RouteWeekday[];
};

export type WeeklyRouteTemplateItem = {
  servicePlanId: string;
  executionOrder: number;
};

export type WeeklyRouteTemplate = {
  id?: string | null;
  employeeUserId: string;
  weekday: RouteWeekday;
  items: WeeklyRouteTemplateItem[];
  updatedAt?: string | null;
};

export type SaveWeeklyRouteTemplateInput = {
  employeeUserId: string;
  weekday: RouteWeekday;
  items: WeeklyRouteTemplateItem[];
};

export type SaveWeeklyRouteTemplateResult = {
  ok: boolean;
  template?: WeeklyRouteTemplate;
  error?: string;
};