"use server";

import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { fetchRouteOneTimeOrders } from "@/app/(private)/routes/one-time-orders.api";
import {
  addDaysIso,
  emptyDashboardMetrics,
  getTodayIso,
  normalizeScheduledDate,
} from "./dashboard.helpers";
import type { DashboardMetrics, DashboardOneTimeOrderReminder } from "./dashboard.types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const companyId = await getCompanyId();
  const data = await mappaFetch<Partial<DashboardMetrics>>(
    `/api/companies/${companyId}/dashboard`,
  );
  return { ...emptyDashboardMetrics, ...data };
}

export async function getDashboardOneTimeOrderReminder(): Promise<DashboardOneTimeOrderReminder> {
  const todayIso = getTodayIso();
  const tomorrowIso = addDaysIso(todayIso, 1);
  const endIso = addDaysIso(todayIso, 7);
  const orders = await fetchRouteOneTimeOrders();
  const ordersWithDate = orders
    .map((order) => ({ id: order.id, scheduledDate: normalizeScheduledDate(order.scheduledDate) }))
    .filter((order) => order.scheduledDate);
  const todayOrders = ordersWithDate.filter((order) => order.scheduledDate === todayIso);
  const tomorrowOrders = ordersWithDate.filter((order) => order.scheduledDate === tomorrowIso);
  const laterOrders = ordersWithDate.filter(
    (order) => order.scheduledDate > tomorrowIso && order.scheduledDate <= endIso,
  );

  return {
    todayIso,
    todayCount: todayOrders.length,
    tomorrowCount: tomorrowOrders.length,
    laterCount: laterOrders.length,
    futureCount: tomorrowOrders.length + laterOrders.length,
    totalUpcomingCount: todayOrders.length + tomorrowOrders.length + laterOrders.length,
    totalAvailableCount: ordersWithDate.length,
    todayOrderIds: todayOrders.map((order) => order.id).sort(),
  };
}
