"use server";

import { getErrorMessage, isMappaApiError } from "@/lib/mappa/errors";
import { fetchRouteOneTimeOrders } from "./one-time-orders.api";
import { mapOneTimeOrder } from "./one-time-orders.mapper";
import type { ListOneTimeServiceOrdersForDateResult } from "./one-time-orders.types";
import type { AvailableRouteWorkOrder } from "./routes.types";

export async function listOneTimeServiceOrdersForRoute(): Promise<AvailableRouteWorkOrder[]> {
  const orders = await fetchRouteOneTimeOrders();
  return orders.map(mapOneTimeOrder);
}

export async function listOneTimeServiceOrdersForDate(
  scheduledDate: string,
): Promise<ListOneTimeServiceOrdersForDateResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    return { ok: false, orders: [], error: "Data inválida para consultar as OS avulsas." };
  }

  try {
    const orders = await fetchRouteOneTimeOrders({ scheduledDate });
    return { ok: true, orders: orders.map(mapOneTimeOrder) };
  } catch (error) {
    if (!isMappaApiError(error)) throw error;
    console.error("[listOneTimeServiceOrdersForDate]", {
      code: error.code,
      status: error.status,
      retryable: error.retryable,
      message: error.message,
    });
    return {
      ok: false,
      orders: [],
      error: getErrorMessage(error, "Não foi possível carregar as OS avulsas desta data."),
    };
  }
}
