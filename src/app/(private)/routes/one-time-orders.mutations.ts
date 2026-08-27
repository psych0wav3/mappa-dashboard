"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage, isMappaApiError } from "@/lib/mappa/errors";
import { removeOneTimeOrderFromRoute } from "./one-time-orders.api";
import type { RemoveOneTimeOrderActionResult } from "./one-time-orders.types";

export async function removeOneTimeOrderFromDailyRoute(params: {
  routeId: string;
  serviceOrderId: string;
}): Promise<RemoveOneTimeOrderActionResult> {
  if (!params.routeId) return { ok: false, error: "Rota não informada." };
  if (!params.serviceOrderId) return { ok: false, error: "OS não informada." };

  try {
    const response = await removeOneTimeOrderFromRoute(params);
    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    return {
      ok: true,
      routeDeleted: response.routeDeleted,
      remainingServiceOrders: response.remainingServiceOrders,
    };
  } catch (error) {
    if (!isMappaApiError(error)) throw error;
    console.error("[removeOneTimeOrderFromDailyRoute]", {
      code: error.code,
      status: error.status,
      retryable: error.retryable,
      message: error.message,
    });
    return {
      ok: false,
      error: getErrorMessage(error, "Não foi possível retirar a OS da rota."),
    };
  }
}
