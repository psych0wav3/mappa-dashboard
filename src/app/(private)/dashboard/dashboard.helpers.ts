import type { DashboardMetrics, DashboardOneTimeOrderReminder } from "./dashboard.types";

export const emptyDashboardMetrics: DashboardMetrics = {
  totalCustomers: 0,
  totalEmployees: 0,
  pendingCompanyPricingOrders: 0,
  pendingCustomerApprovalOrders: 0,
  waitingExecutionOrders: 0,
  inRouteOrders: 0,
  doneOrdersToday: 0,
  plannedRoutesToday: 0,
};

export function getTodayIso() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDaysIso(date: string, amount: number) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function normalizeScheduledDate(value?: string | null) {
  const date = String(value || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

export function createEmptyDashboardOneTimeOrderReminder(): DashboardOneTimeOrderReminder {
  return {
    todayIso: getTodayIso(),
    todayCount: 0,
    tomorrowCount: 0,
    laterCount: 0,
    futureCount: 0,
    totalUpcomingCount: 0,
    totalAvailableCount: 0,
    todayOrderIds: [],
  };
}
