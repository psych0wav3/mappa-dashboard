"use server";

import { safeData } from "@/lib/mappa/safe-load";

import {
  fetchRouteDetails,
  fetchRouteEmployees,
  fetchRoutes,
  fetchWaitingExecutionServiceOrders,
} from "./routes.api";
import {
  employeeDisplayName,
  mergeRouteDashboardItems,
  normalizeRouteDetails,
  normalizeWorkOrderForRoute,
} from "./routes.mapper";
import { normalizeStatus, splitName } from "./routes.parsers";
import type {
  ApiRouteDetailsResponse,
  AvailableRouteWorkOrder,
  RouteDashboardItem,
  RouteTechnicianOption,
} from "./routes.types";
import { normalizeRouteOrigin } from "./routes.validation";

export async function listRouteTechnicians(): Promise<RouteTechnicianOption[]> {
  const employees = await fetchRouteEmployees();

  return employees
    .filter((employee) => String(employee.status || "").toUpperCase() !== "INACTIVE")
    .map((employee) => ({
      id: employee.userId || employee.id,
      name: employeeDisplayName(employee),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
}

export async function listTechniciansLite() {
  const technicians = await listRouteTechnicians();

  return technicians.map((technician) => {
    const { firstName, lastName } = splitName(technician.name);
    return { id: technician.id, firstName, lastName };
  });
}

export async function listApprovedServiceOrdersForRoute(): Promise<
  AvailableRouteWorkOrder[]
> {
  const orders = await fetchWaitingExecutionServiceOrders();

  return orders
    .filter((order) => normalizeStatus(order.status) === "waitingexecution")
    .map(normalizeWorkOrderForRoute)
    .sort((first, second) => {
      const dateCompare = String(first.scheduledDate || "").localeCompare(
        String(second.scheduledDate || ""),
      );
      return dateCompare || first.customerName.localeCompare(second.customerName, "pt-BR");
    });
}

export async function listOneTimeServiceOrdersForRoute(): Promise<
  AvailableRouteWorkOrder[]
> {
  const orders = await listApprovedServiceOrdersForRoute();
  const acceptedOrigins = new Set([
    "adminonetime",
    "employeeadditional",
    "employeerequest",
  ]);

  return orders.filter((order) => acceptedOrigins.has(normalizeRouteOrigin(order.origin)));
}

export async function listRoutesForDashboard(params?: {
  routeDate?: string;
  status?: string;
  employeeUserId?: string;
}): Promise<RouteDashboardItem[]> {
  const routes = await fetchRoutes(params);
  const detailed = await Promise.all(
    routes.map((route) =>
      safeData({
        resource: `detalhes da rota ${route.id}`,
        fallback: {
          id: route.id,
          title: route.title,
          routeDate: route.routeDate,
          employeeUserId: route.employeeUserId,
          employeeName: route.employeeName,
          status: route.status,
          serviceOrders: [],
          createdAt: route.createdAt,
        } satisfies ApiRouteDetailsResponse,
        loader: () => fetchRouteDetails(route.id),
      }),
    ),
  );

  return mergeRouteDashboardItems(detailed.map(normalizeRouteDetails)).sort(
    (first, second) => {
      const dateCompare = String(second.routeDate || "").localeCompare(
        String(first.routeDate || ""),
      );
      return dateCompare || first.employeeName.localeCompare(second.employeeName, "pt-BR");
    },
  );
}
