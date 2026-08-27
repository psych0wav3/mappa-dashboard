"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage, isMappaApiError } from "@/lib/mappa/errors";
import { saveWeeklyRouteTemplateApi } from "./weekly-route.api";
import { ALL_ROUTE_WEEKDAYS } from "./weekly-route.constants";
import { normalizeWeeklyTemplate } from "./weekly-route.normalizers";
import type {
  SaveWeeklyRouteTemplateInput,
  SaveWeeklyRouteTemplateResult,
} from "./weekly-route.types";

export async function saveWeeklyRouteTemplate(
  input: SaveWeeklyRouteTemplateInput,
): Promise<SaveWeeklyRouteTemplateResult> {
  if (!input.employeeUserId) {
    return { ok: false, error: "Selecione o técnico responsável." };
  }
  if (!ALL_ROUTE_WEEKDAYS.includes(input.weekday)) {
    return { ok: false, error: "Selecione um dia da semana válido." };
  }

  const servicePlanIds = Array.from(
    new Set(input.items.map((item) => item.servicePlanId).filter(Boolean)),
  );
  const payload: SaveWeeklyRouteTemplateInput = {
    employeeUserId: input.employeeUserId,
    weekday: input.weekday,
    items: servicePlanIds.map((servicePlanId, index) => ({
      servicePlanId,
      executionOrder: index + 1,
    })),
  };

  try {
    const template = await saveWeeklyRouteTemplateApi(payload);
    revalidatePath("/routes/builder");
    revalidatePath("/routes/dashboard");
    return { ok: true, template: normalizeWeeklyTemplate(template) };
  } catch (error) {
    if (!isMappaApiError(error)) throw error;
    console.error("[saveWeeklyRouteTemplate]", {
      code: error.code,
      status: error.status,
      retryable: error.retryable,
      message: error.message,
    });
    return {
      ok: false,
      error: getErrorMessage(error, "Não foi possível salvar a rota padrão."),
    };
  }
}
