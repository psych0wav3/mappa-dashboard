"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage, isMappaApiError } from "@/lib/mappa/errors";
import {
  addServiceOrdersToRoute,
  createRoute,
  fetchRouteDetails,
  fetchRoutes,
  updateRouteEmployee,
} from "./routes.api";
import { normalizeRouteDetails } from "./routes.mapper";
import type {
  ApiRouteDetailsResponse,
  CreateRoutePlannerInput,
  CreateRoutePlannerResult,
  RouteDashboardItem,
} from "./routes.types";
import { routeTitle, validateRouteInput } from "./routes.validation";

function reportKnownApiError(scope: string, error: unknown) {
  if (!isMappaApiError(error)) throw error;
  console.error(`[${scope}]`, {
    code: error.code,
    status: error.status,
    retryable: error.retryable,
    message: error.message,
  });
}

async function loadRoutesWithDetails(routeDate: string, employeeUserId: string) {
  const routes = await fetchRoutes({ routeDate, employeeUserId });
  return Promise.all(routes.map((route) => fetchRouteDetails(route.id)));
}

function routeWithMostOrders(routes: ApiRouteDetailsResponse[]) {
  return [...routes].sort(
    (first, second) =>
      (second.serviceOrders?.length || 0) - (first.serviceOrders?.length || 0),
  )[0];
}

function nextExecutionOrder(route: ApiRouteDetailsResponse) {
  return Math.max(
    0,
    ...(route.serviceOrders || []).map((order) => Number(order.executionOrder || 0)),
  ) + 1;
}

export async function createRouteFromPlanner(
  input: CreateRoutePlannerInput,
): Promise<CreateRoutePlannerResult> {
  let validated: ReturnType<typeof validateRouteInput>;
  try {
    validated = validateRouteInput(input);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error, "Não foi possível validar os dados da rota.") };
  }

  try {
    const existingRoutes = await loadRoutesWithDetails(validated.routeDate, validated.employeeUserId);
    let route: ApiRouteDetailsResponse;

    if (existingRoutes.length) {
      const primaryRoute = routeWithMostOrders(existingRoutes);
      const existingIds = new Set(
        existingRoutes.flatMap((item) =>
          (item.serviceOrders || []).map((order) => order.serviceOrderId || order.id || ""),
        ).filter(Boolean),
      );
      const idsToAdd = validated.serviceOrderIds.filter((id) => !existingIds.has(id));
      route = idsToAdd.length
        ? await addServiceOrdersToRoute({
            routeId: primaryRoute.id,
            serviceOrders: idsToAdd.map((serviceOrderId, index) => ({
              serviceOrderId,
              executionOrder: nextExecutionOrder(primaryRoute) + index,
            })),
          })
        : primaryRoute;
    } else {
      const created = await createRoute({
        title: validated.title,
        routeDate: validated.routeDate,
        employeeUserId: validated.employeeUserId,
      });
      route = await addServiceOrdersToRoute({
        routeId: created.id,
        serviceOrders: validated.serviceOrderIds.map((serviceOrderId, index) => ({
          serviceOrderId,
          executionOrder: index + 1,
        })),
      });
    }

    revalidatePath("/routes/builder");
    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    return { ok: true, route };
  } catch (error) {
    reportKnownApiError("createRouteFromPlanner", error);
    return { ok: false, error: getErrorMessage(error, "Não foi possível criar a rota.") };
  }
}

export async function addOneTimeServiceOrderToDailyRoute(input: {
  serviceOrderId: string;
  routeDate: string;
  employeeUserId: string;
  employeeName: string;
}): Promise<{ ok: boolean; route?: RouteDashboardItem; error?: string }> {
  if (!input.serviceOrderId) return { ok: false, error: "OS não informada." };
  if (!input.employeeUserId) return { ok: false, error: "Selecione o técnico responsável." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.routeDate)) {
    return { ok: false, error: "Data da rota inválida." };
  }

  try {
    const currentRoutes = await loadRoutesWithDetails(input.routeDate, input.employeeUserId);
    let routeDetails: ApiRouteDetailsResponse;

    if (currentRoutes.length) {
      const existingRoute = currentRoutes.find((route) =>
        (route.serviceOrders || []).some(
          (order) => (order.serviceOrderId || order.id) === input.serviceOrderId,
        ),
      );
      if (existingRoute) {
        routeDetails = existingRoute;
      } else {
        const currentRoute = routeWithMostOrders(currentRoutes);
        routeDetails = await addServiceOrdersToRoute({
          routeId: currentRoute.id,
          serviceOrders: [{
            serviceOrderId: input.serviceOrderId,
            executionOrder: nextExecutionOrder(currentRoute),
          }],
        });
      }
    } else {
      const created = await createRoute({
        title: routeTitle(input.routeDate, input.employeeName),
        routeDate: input.routeDate,
        employeeUserId: input.employeeUserId,
      });
      routeDetails = await addServiceOrdersToRoute({
        routeId: created.id,
        serviceOrders: [{ serviceOrderId: input.serviceOrderId, executionOrder: 1 }],
      });
    }

    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    return { ok: true, route: normalizeRouteDetails(routeDetails) };
  } catch (error) {
    reportKnownApiError("addOneTimeServiceOrderToDailyRoute", error);
    return { ok: false, error: getErrorMessage(error, "Não foi possível adicionar a OS à rota.") };
  }
}

export async function changeRouteEmployee(params: { routeId: string; employeeUserId: string }) {
  if (!params.routeId) throw new Error("ID da rota não informado.");
  if (!params.employeeUserId) throw new Error("Selecione o técnico responsável.");
  const updated = await updateRouteEmployee(params);
  revalidatePath("/routes/dashboard");
  return updated;
}
