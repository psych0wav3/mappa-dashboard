"use server";

import { revalidatePath } from "next/cache";

import {
  addServiceOrdersToRoute,
  createRoute,
  fetchRouteDetails,
  fetchRouteEmployees,
  fetchRoutes,
  fetchWaitingExecutionServiceOrders,
  updateRouteEmployee,
} from "./routes.api";

import {
  normalizeStatus,
  splitName,
} from "./routes.parsers";

import {
  employeeDisplayName,
  normalizeRouteDetails,
  normalizeWorkOrderForRoute,
} from "./routes.mapper";

import type {
  ApiRouteDetailsResponse,
  AvailableRouteWorkOrder,
  CreateRoutePlannerInput,
  CreateRoutePlannerResult,
  RouteDashboardItem,
  RouteTechnicianOption,
} from "./routes.types";

export type {
  ApiRouteDetailsResponse,
  AvailableRouteWorkOrder,
  CreateRoutePlannerInput,
  CreateRoutePlannerResult,
  RouteDashboardItem,
  RouteTechnicianOption,
};

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

    return {
      id: technician.id,
      firstName,
      lastName,
    };
  });
}

export async function listApprovedServiceOrdersForRoute(): Promise<AvailableRouteWorkOrder[]> {
  const orders = await fetchWaitingExecutionServiceOrders();

  return orders
    .filter((order) => normalizeStatus(order.status) === "waitingexecution")
    .map(normalizeWorkOrderForRoute)
    .sort((first, second) => {
      const dateCompare = String(first.scheduledDate || "").localeCompare(String(second.scheduledDate || ""));

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return first.customerName.localeCompare(second.customerName, "pt-BR");
    });
}

function normalizeOrigin(value?: string | null) {
  return String(value || "").replace(/[_\s-]/g, "").toLowerCase();
}

export async function listOneTimeServiceOrdersForRoute(): Promise<AvailableRouteWorkOrder[]> {
  const orders = await listApprovedServiceOrdersForRoute();

  return orders.filter((order) => {
    const origin = normalizeOrigin(order.origin);

    return origin === "adminonetime" || origin === "employeeadditional" || origin === "employeerequest";
  });
}

function validateRouteInput(input: CreateRoutePlannerInput) {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Informe o nome da rota.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.routeDate)) {
    throw new Error("Informe uma data válida para a rota.");
  }

  if (!input.employeeUserId) {
    throw new Error("Selecione o técnico responsável.");
  }

  const serviceOrderIds = Array.from(new Set(input.serviceOrderIds.filter(Boolean)));

  if (!serviceOrderIds.length) {
    throw new Error("Adicione ao menos uma OS à rota.");
  }

  return {
    title,
    routeDate: input.routeDate,
    employeeUserId: input.employeeUserId,
    serviceOrderIds,
  };
}

export async function createRouteFromPlanner(input: CreateRoutePlannerInput): Promise<CreateRoutePlannerResult> {
  try {
    const validated = validateRouteInput(input);

    const created = await createRoute({
      title: validated.title,
      routeDate: validated.routeDate,
      employeeUserId: validated.employeeUserId,
    });

    const route = await addServiceOrdersToRoute({
      routeId: created.id,
      serviceOrders: validated.serviceOrderIds.map((serviceOrderId, index) => ({
        serviceOrderId,
        executionOrder: index + 1,
      })),
    });

    revalidatePath("/routes/builder");
    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    revalidatePath("/workorders/approved");

    return {
      ok: true,
      route,
    };
  } catch (error) {
    console.error("[createRouteFromPlanner]", error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível criar a rota.",
    };
  }
}

function routeTitle(routeDate: string, employeeName: string) {
  const weekday = new Date(`${routeDate}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
  });

  const formattedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;

  return `Rota de ${formattedWeekday} — ${employeeName}`;
}

export async function addOneTimeServiceOrderToDailyRoute(input: {
  serviceOrderId: string;
  routeDate: string;
  employeeUserId: string;
  employeeName: string;
}): Promise<{
  ok: boolean;
  route?: RouteDashboardItem;
  error?: string;
}> {
  try {
    if (!input.serviceOrderId) {
      throw new Error("OS não informada.");
    }

    if (!input.employeeUserId) {
      throw new Error("Selecione o técnico responsável.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.routeDate)) {
      throw new Error("Data da rota inválida.");
    }

    const routes = await fetchRoutes({
      routeDate: input.routeDate,
      employeeUserId: input.employeeUserId,
    });

    let routeDetails: ApiRouteDetailsResponse;

    if (routes.length > 0) {
      const currentRoute = await fetchRouteDetails(routes[0].id);

      const nextExecutionOrder = Math.max(
        0,
        ...(currentRoute.serviceOrders || []).map((order) => Number(order.executionOrder || 0)),
      ) + 1;

      routeDetails = await addServiceOrdersToRoute({
        routeId: currentRoute.id,
        serviceOrders: [
          {
            serviceOrderId: input.serviceOrderId,
            executionOrder: nextExecutionOrder,
          },
        ],
      });
    } else {
      const createdRoute = await createRoute({
        title: routeTitle(input.routeDate, input.employeeName),
        routeDate: input.routeDate,
        employeeUserId: input.employeeUserId,
      });

      routeDetails = await addServiceOrdersToRoute({
        routeId: createdRoute.id,
        serviceOrders: [
          {
            serviceOrderId: input.serviceOrderId,
            executionOrder: 1,
          },
        ],
      });
    }

    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    revalidatePath("/workorders/approved");

    return {
      ok: true,
      route: normalizeRouteDetails(routeDetails),
    };
  } catch (error) {
    console.error("[addOneTimeServiceOrderToDailyRoute]", error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível adicionar a OS à rota.",
    };
  }
}

export async function changeRouteEmployee(params: {
  routeId: string;
  employeeUserId: string;
}) {
  if (!params.routeId) {
    throw new Error("ID da rota não informado.");
  }

  if (!params.employeeUserId) {
    throw new Error("Selecione o técnico responsável.");
  }

  const updated = await updateRouteEmployee(params);

  revalidatePath("/routes/dashboard");

  return updated;
}

export async function listRoutesForDashboard(params?: {
  routeDate?: string;
  status?: string;
  employeeUserId?: string;
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
      .sort((first, second) => {
        const dateCompare = String(second.routeDate || "").localeCompare(String(first.routeDate || ""));

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return first.employeeName.localeCompare(second.employeeName, "pt-BR");
      });
  } catch (error) {
    console.error("[listRoutesForDashboard]", error);

    return [];
  }
}