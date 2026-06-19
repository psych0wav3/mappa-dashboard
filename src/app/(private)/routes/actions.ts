"use server";

import { revalidatePath } from "next/cache";

import { extractItems } from "@/lib/mappa/api";

import {
  addServiceOrdersToRoute,
  createRoute,
  fetchRouteDetails,
  fetchRouteEmployees,
  fetchRoutes,
  fetchWaitingExecutionServiceOrders,
} from "./routes.api";

import {
  normalizeStatus,
  splitName,
  toApiDate,
  weekdayToDate,
} from "./routes.parsers";

import {
  employeeDisplayName,
  normalizeRouteDetails,
  normalizeWorkOrderForRoute,
} from "./routes.mapper";

import type {
  ApiRouteDetailsResponse,
  CreateWeeklyRoutesInput,
  CreateWeeklyRoutesResult,
  RouteDashboardItem,
  RouteTechnicianOption,
  RouteWeekday,
  AvailableRouteWorkOrder,
} from "./routes.types";

export type {
  ApiRouteDetailsResponse,
  AvailableRouteWorkOrder,
  CreateWeeklyRoutesInput,
  CreateWeeklyRoutesResult,
  RouteDashboardItem,
  RouteTechnicianOption,
  RouteWeekday,
};

export async function listRouteTechnicians(): Promise<RouteTechnicianOption[]> {
  const employees = await fetchRouteEmployees();

  return employees
    .filter((employee) => employee.status !== "INACTIVE")
    .map((employee) => ({
      id: employee.userId || employee.id,
      name: employeeDisplayName(employee),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listTechniciansLite() {
  const technicians = await listRouteTechnicians();

  return technicians.map((technician) => {
    const { firstName, lastName } = splitName(technician.name);

    return {
      id: technician.id,
      firstName,
      lastName,
    };
  });
}

/**
 * Lista somente OS que podem entrar em rota.
 * A API exige status WaitingExecution.
 */
export async function listApprovedServiceOrdersForRoute(): Promise<
  AvailableRouteWorkOrder[]
> {
  const orders = await fetchWaitingExecutionServiceOrders();

  return orders
    .filter((order) => normalizeStatus(order.status) === "waitingexecution")
    .map(normalizeWorkOrderForRoute)
    .sort((a, b) => {
      const dateCompare = String(a.scheduledDate || "").localeCompare(
        String(b.scheduledDate || ""),
      );

      if (dateCompare !== 0) return dateCompare;

      const timeCompare = String(a.scheduledTime || "").localeCompare(
        String(b.scheduledTime || ""),
      );

      if (timeCompare !== 0) return timeCompare;

      return a.customerName.localeCompare(b.customerName, "pt-BR");
    });
}

export async function createWeeklyRoutesFromPlanner(
  input: CreateWeeklyRoutesInput,
): Promise<CreateWeeklyRoutesResult> {
  try {
    if (!input.employeeUserId) {
      return {
        ok: false,
        count: 0,
        routes: [],
        error: "Selecione o técnico responsável.",
      };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.weekStartDate)) {
      return {
        ok: false,
        count: 0,
        routes: [],
        error: "Semana inválida.",
      };
    }

    if (!input.items?.length) {
      return {
        ok: false,
        count: 0,
        routes: [],
        error: "Adicione pelo menos uma OS ao planejamento.",
      };
    }

    const grouped = new Map<
      string,
      Array<{
        serviceOrderId: string;
        executionOrder: number;
      }>
    >();

    for (const item of input.items) {
      const weekdays: RouteWeekday[] = item.weekdays.length
        ? item.weekdays
        : ["MONDAY"];

      for (const weekday of weekdays) {
        const routeDate = weekdayToDate(input.weekStartDate, weekday);

        const current = grouped.get(routeDate) || [];

        current.push({
          serviceOrderId: item.serviceOrderId,
          executionOrder: current.length + 1,
        });

        grouped.set(routeDate, current);
      }
    }

    const createdRoutes: ApiRouteDetailsResponse[] = [];

    for (const [routeDate, serviceOrders] of grouped.entries()) {
      const route = await createRoute({
        title: `Rota ${toApiDate(routeDate)}`,
        routeDate,
        employeeUserId: input.employeeUserId,
      });

      const updated = await addServiceOrdersToRoute({
        routeId: route.id,
        serviceOrders,
      });

      createdRoutes.push(updated);
    }

    revalidatePath("/routes/builder");
    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    revalidatePath("/workorders/approved");

    return {
      ok: true,
      count: createdRoutes.length,
      routes: createdRoutes,
    };
  } catch (error: any) {
    console.error("[createWeeklyRoutesFromPlanner]", error);

    return {
      ok: false,
      count: 0,
      routes: [],
      error:
        error?.message ||
        "Não foi possível criar a rota. Verifique o status das OS selecionadas.",
    };
  }
}

export async function listRoutesForDashboard(params?: {
  routeDate?: string;
  status?: string;
}): Promise<RouteDashboardItem[]> {
  try {
    const routes = await fetchRoutes(params);

    const detailed = await Promise.all(
      routes.map(async (route) => {
        try {
          return await fetchRouteDetails(route.id);
        } catch {
          return {
            id: route.id,
            title: route.title,
            routeDate: route.routeDate,
            employeeUserId: route.employeeUserId,
            employeeName: route.employeeName,
            status: route.status,
            serviceOrders: [],
            createdAt: route.createdAt,
          } satisfies ApiRouteDetailsResponse;
        }
      }),
    );

    return detailed
      .map(normalizeRouteDetails)
      .sort((a, b) => {
        const dateCompare = String(b.routeDate || "").localeCompare(
          String(a.routeDate || ""),
        );

        if (dateCompare !== 0) return dateCompare;

        return a.employeeName.localeCompare(b.employeeName, "pt-BR");
      });
  } catch (error) {
    console.error("[listRoutesForDashboard]", error);

    return [];
  }
}