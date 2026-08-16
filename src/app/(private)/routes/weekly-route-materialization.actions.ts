"use server";

import {
  revalidatePath,
} from "next/cache";

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

export async function loadRouteWeek(params: {
  dateFrom: string;
  dateTo: string;
}): Promise<LoadRouteWeekResult> {
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
    console.error(
      "[loadRouteWeek]",
      error,
    );

    return {
      ok: false,
      routes: [],

      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as rotas da semana.",
    };
  }
}