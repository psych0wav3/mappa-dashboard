"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  getErrorMessage,
  isMappaApiError,
} from "@/lib/mappa/errors";

import {
  listRoutesForDashboard,
} from "./actions";

import {
  materializeWeeklyRoutes,
} from "./weekly-route-materialization.api";

import type {
  RouteDashboardItem,
} from "./routes.types";

export type LoadRouteWeekResult = {
  ok: boolean;
  routes: RouteDashboardItem[];
  createdRoutes?: number;
  createdServiceOrders?: number;
  addedServiceOrders?: number;
  error?: string;
};

function isIsoDate(
  value: string,
) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    value,
  );
}

export async function loadRouteWeek(params: {
  dateFrom: string;
  dateTo: string;
}): Promise<LoadRouteWeekResult> {
  /*
   * Datas inválidas são erro esperado
   * de entrada e podem voltar como
   * resultado amigável.
   */
  if (
    !isIsoDate(
      params.dateFrom,
    ) ||
    !isIsoDate(
      params.dateTo,
    )
  ) {
    return {
      ok: false,
      routes: [],
      error:
        "Período inválido para carregar as rotas da semana.",
    };
  }

  if (
    params.dateTo <
    params.dateFrom
  ) {
    return {
      ok: false,
      routes: [],
      error:
        "A data final da semana não pode ser anterior à data inicial.",
    };
  }

  try {
    const materialization =
      await materializeWeeklyRoutes({
        dateFrom:
          params.dateFrom,

        dateTo:
          params.dateTo,
      });

    const routes =
      await listRoutesForDashboard();

    revalidatePath(
      "/routes/dashboard",
    );

    revalidatePath(
      "/workorders",
    );

    return {
      ok: true,
      routes,

      createdRoutes:
        materialization.createdRoutes,

      createdServiceOrders:
        materialization.createdServiceOrders,

      addedServiceOrders:
        materialization.addedServiceOrders,
    };
  } catch (error) {
    /*
     * Somente erros conhecidos da API
     * são convertidos em { ok: false }.
     *
     * Redirect do Next, bug de código ou
     * qualquer erro inesperado continuam
     * subindo normalmente.
     */
    if (
      !isMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      "[loadRouteWeek]",
      {
        code:
          error.code,

        status:
          error.status,

        retryable:
          error.retryable,

        message:
          error.message,
      },
    );

    return {
      ok: false,
      routes: [],

      error:
        getErrorMessage(
          error,
          "Não foi possível carregar as rotas da semana.",
        ),
    };
  }
}
