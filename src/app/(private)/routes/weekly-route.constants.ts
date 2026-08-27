import type { RouteWeekday } from "./routes.types";

export const WEEKDAY_BY_NUMBER: Record<number, RouteWeekday> = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  7: "SUNDAY",
};

export const ALL_ROUTE_WEEKDAYS: RouteWeekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
