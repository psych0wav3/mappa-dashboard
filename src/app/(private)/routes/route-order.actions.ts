"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  getErrorMessage,
  isMappaApiError,
} from "@/lib/mappa/errors";

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

function failure(
  message: string,
): RouteOrderActionResult {
  return {
    ok: false,
    serviceOrders: [],
    error: message,
  };
}

export async function getRouteOrder(
  routeId: string,
): Promise<RouteOrderActionResult> {
  /*
   * Validação esperada da action.
   *
   * Mantemos o contrato { ok: false }
   * sem transformar a validação em exception.
   */
  if (!routeId) {
    return failure(
      "Rota não informada.",
    );
  }

  try {
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
    /*
     * Somente erros conhecidos da API
     * viram um resultado amigável.
     *
     * Bugs, redirects do Next e erros
     * inesperados continuam subindo.
     */
    if (
      !isMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      "[getRouteOrder]",
      {
        code: error.code,
        status: error.status,
        retryable:
          error.retryable,
        message:
          error.message,
      },
    );

    return failure(
      getErrorMessage(
        error,
        "Não foi possível carregar a ordem da rota.",
      ),
    );
  }
}

export async function saveRouteOrder(
  routeId: string,
  serviceOrderIds: string[],
): Promise<RouteOrderActionResult> {
  if (!routeId) {
    return failure(
      "Rota não informada.",
    );
  }

  const ids = Array.from(
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
    return failure(
      "A rota possui uma OS duplicada.",
    );
  }

  try {
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
    if (
      !isMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      "[saveRouteOrder]",
      {
        code: error.code,
        status: error.status,
        retryable:
          error.retryable,
        message:
          error.message,
      },
    );

    return failure(
      getErrorMessage(
        error,
        "Não foi possível salvar a ordem da rota.",
      ),
    );
  }
}