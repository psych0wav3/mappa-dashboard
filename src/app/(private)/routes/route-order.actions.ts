"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  fetchRouteOrder,
  updateRouteOrder,
} from "./route-order.api";

import type {
  RouteOrderItem,
} from "./route-order.api";

export type RouteOrderActionResult = {
  ok: boolean;
  serviceOrders: RouteOrderItem[];
  error?: string;
};

export async function getRouteOrder(
  routeId: string,
): Promise<RouteOrderActionResult> {
  try {
    if (!routeId) {
      throw new Error(
        "Rota não informada.",
      );
    }

    const response =
      await fetchRouteOrder(
        routeId,
      );

    return {
      ok: true,
      serviceOrders:
        response.serviceOrders ||
        [],
    };
  } catch (error) {
    console.error(
      "[getRouteOrder]",
      error,
    );

    return {
      ok: false,
      serviceOrders: [],
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a ordem da rota.",
    };
  }
}

export async function saveRouteOrder(
  routeId: string,
  serviceOrderIds: string[],
): Promise<RouteOrderActionResult> {
  try {
    if (!routeId) {
      throw new Error(
        "Rota não informada.",
      );
    }

    const ids =
      Array.from(
        new Set(
          serviceOrderIds.filter(
            Boolean,
          ),
        ),
      );

    if (
      ids.length !==
      serviceOrderIds.length
    ) {
      throw new Error(
        "A rota possui uma OS duplicada.",
      );
    }

    const response =
      await updateRouteOrder(
        routeId,
        ids.map(
          (
            serviceOrderId,
            index,
          ) => ({
            serviceOrderId,
            executionOrder:
              index + 1,
          }),
        ),
      );

    revalidatePath(
      "/routes/dashboard",
    );

    return {
      ok: true,
      serviceOrders:
        response.serviceOrders ||
        [],
    };
  } catch (error) {
    console.error(
      "[saveRouteOrder]",
      error,
    );

    return {
      ok: false,
      serviceOrders: [],
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a ordem da rota.",
    };
  }
}